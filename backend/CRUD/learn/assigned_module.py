# backend/CRUD/learn/assigned_module.py

from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from models.learn.assigned_module import AssignedModule
from models.learn.module_course import ModuleCourse
from models.learn.module_skill import ModuleSkill
from models.learn.assigned_courses import AssignedCourse
from models.learn.assigned_skill import AssignedSkill
from schemas.learn.assigned_module import AssignedModuleCreate
from models.user import User

from schemas.learn.assigned_courses import AssignedCourseCreate
from schemas.learn.assigned_skill import AssignedSkillCreate
from .assigned_courses import assign_course
from .assigned_skill import assign_skill


def assign_module(db: Session, data: AssignedModuleCreate) -> AssignedModule:
    assigned = AssignedModule(
        user_id=data.user_id,
        module_id=data.module_id,
        assigned_at=datetime.utcnow(),
        status="assigned",
        expiry_duration=data.expiry_duration,
        due_date=data.due_date,
        assigned_by=data.assigned_by
    )
    db.add(assigned)
    db.commit()
    db.refresh(assigned)

    # Assign linked courses using existing logic
    module_courses = db.query(ModuleCourse).filter_by(module_id=data.module_id).all()
    for mc in module_courses:
        assign_course(db, AssignedCourseCreate(
            user_id=data.user_id,
            course_id=mc.course_id,
            assigned_by=data.assigned_by,
            due_date=data.due_date,
            expiry_duration=data.expiry_duration
        ))

    # Assign linked skills using existing logic
    module_skills = db.query(ModuleSkill).filter_by(module_id=data.module_id).all()
    for ms in module_skills:
        assign_skill(db, AssignedSkillCreate(
            user_id=data.user_id,
            skill_id=ms.skill_id,
            assigned_by=data.assigned_by,
            due_date=data.due_date,
            expiry_duration=data.expiry_duration
        ))

    return assigned


def get_user_modules(db: Session, user_id: int) -> list[AssignedModule]:
    return (
        db.query(AssignedModule)
        .filter(AssignedModule.user_id == user_id)
        .options(joinedload(AssignedModule.module))
        .all()
    )


def complete_module(db: Session, assigned_module_id: int) -> AssignedModule:
    assigned = db.query(AssignedModule).get(assigned_module_id)
    if assigned:
        # Optional: verify actual completion before marking complete
        check_and_complete_modules(db, user_id=assigned.user_id, item_id=assigned.module_id, is_course=True)
    return assigned


def check_and_complete_modules(db: Session, user_id: int, item_id: str, is_course: bool):
    from models.learn.assigned_module import AssignedModule
    from models.learn.module_course import ModuleCourse
    from models.learn.module_skill import ModuleSkill
    from models.learn.assigned_courses import AssignedCourse
    from models.learn.assigned_skill import AssignedSkill

    module_ids = (
        db.query(ModuleCourse.module_id)
        .filter(ModuleCourse.course_id == item_id)
        .all() if is_course else
        db.query(ModuleSkill.module_id)
        .filter(ModuleSkill.skill_id == item_id)
        .all()
    )
    module_ids = [m[0] for m in module_ids]

    for module_id in module_ids:
        assigned_module = (
            db.query(AssignedModule)
            .filter_by(user_id=user_id, module_id=module_id)
            .first()
        )
        if not assigned_module:
            continue

        # Check completion status
        course_ids = [c.course_id for c in db.query(ModuleCourse).filter_by(module_id=module_id).all()]
        skill_ids = [s.skill_id for s in db.query(ModuleSkill).filter_by(module_id=module_id).all()]

        valid_courses = db.query(AssignedCourse).filter(
            AssignedCourse.user_id == user_id,
            AssignedCourse.course_id.in_(course_ids),
            AssignedCourse.status == "completed"
        ).count()

        valid_skills = db.query(AssignedSkill).filter(
            AssignedSkill.user_id == user_id,
            AssignedSkill.skill_id.in_(skill_ids),
            AssignedSkill.status == "completed"
        ).count()

        if valid_courses == len(course_ids) and valid_skills == len(skill_ids):
            assigned_module.status = "completed"
            assigned_module.completed_at = datetime.utcnow()
            db.commit()


def reset_module_progress_if_needed(db: Session, user_id: int, module_id: UUID):
    """Force a recheck of completion status for a module."""
    course_ids = [c.course_id for c in db.query(ModuleCourse).filter_by(module_id=module_id).all()]
    skill_ids = [s.skill_id for s in db.query(ModuleSkill).filter_by(module_id=module_id).all()]

    valid_courses = db.query(AssignedCourse).filter(
        AssignedCourse.user_id == user_id,
        AssignedCourse.course_id.in_(course_ids),
        AssignedCourse.status == "completed"
    ).count()

    valid_skills = db.query(AssignedSkill).filter(
        AssignedSkill.user_id == user_id,
        AssignedSkill.skill_id.in_(skill_ids),
        AssignedSkill.status == "completed"
    ).count()

    if valid_courses != len(course_ids) or valid_skills != len(skill_ids):
        assignment = db.query(AssignedModule).filter_by(user_id=user_id, module_id=module_id).first()
        if assignment and assignment.status == "completed":
            assignment.status = "assigned"
            assignment.completed_at = None
            db.commit()


def get_users_assigned_to_module(db: Session, module_id: str):
    return (
        db.query(AssignedModule)
        .filter(AssignedModule.module_id == module_id)
        .join(User, User.id == AssignedModule.user_id)
        .add_columns(User.id, User.first_name, User.last_name, User.email)
        .all()
    )


def update_assigned_module(db: Session, user_id: int, module_id: UUID, updates: dict) -> AssignedModule | None:
    assignment = db.query(AssignedModule).filter_by(user_id=user_id, module_id=module_id).first()
    if not assignment:
        return None

    for key, value in updates.items():
        if hasattr(assignment, key) and value is not None:
            setattr(assignment, key, value)

    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assigned_module(db: Session, user_id: int, module_id: UUID) -> bool:
    assignment = db.query(AssignedModule).filter_by(user_id=user_id, module_id=module_id).first()
    if not assignment:
        return False
    db.delete(assignment)
    db.commit()
    return True
