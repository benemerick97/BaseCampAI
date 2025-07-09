# backend/CRUD/learn/assigned_module.py

from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from models.learn.assigned_module import AssignedModule
from models.learn.module_course import ModuleCourse
from models.learn.module_skill import ModuleSkill
from models.learn.assigned_courses import AssignedCourse
from models.learn.assigned_skill import AssignedSkill
from schemas.learn.assigned_module import AssignedModuleCreate


def assign_module(db: Session, data: AssignedModuleCreate) -> AssignedModule:
    # Step 1: Assign the module
    assigned = AssignedModule(
        user_id=data.user_id,
        module_id=data.module_id,
        assigned_at=datetime.utcnow(),
        status="assigned"
    )
    db.add(assigned)
    db.commit()
    db.refresh(assigned)

    # Step 2: Assign all linked courses to the user
    module_courses = db.query(ModuleCourse).filter_by(module_id=data.module_id).all()
    for mc in module_courses:
        exists = db.query(AssignedCourse).filter_by(
            user_id=data.user_id,
            course_id=mc.course_id
        ).first()
        if not exists:
            db.add(AssignedCourse(
                user_id=data.user_id,
                course_id=mc.course_id,
                assigned_at=datetime.utcnow(),
                status="assigned"
            ))

    # Step 3: Assign all linked skills to the user
    module_skills = db.query(ModuleSkill).filter_by(module_id=data.module_id).all()
    for ms in module_skills:
        exists = db.query(AssignedSkill).filter_by(
            user_id=data.user_id,
            skill_id=ms.skill_id
        ).first()
        if not exists:
            db.add(AssignedSkill(
                user_id=data.user_id,
                skill_id=ms.skill_id,
                assigned_at=datetime.utcnow(),
                status="assigned"
            ))

    db.commit()
    return assigned


def get_user_modules(db: Session, user_id: int) -> list[AssignedModule]:
    return (
        db.query(AssignedModule)
        .filter(AssignedModule.user_id == user_id)
        .options(joinedload(AssignedModule.module))  # ✅ Eager load module relationship
        .all()
    )


def complete_module(db: Session, assigned_module_id: int) -> AssignedModule:
    assigned = db.query(AssignedModule).get(assigned_module_id)
    if assigned:
        assigned.status = "completed"
        assigned.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(assigned)
    return assigned


def check_and_complete_modules(db: Session, user_id: int, item_id: str, is_course: bool):
    from models.learn.assigned_module import AssignedModule
    from models.learn.module_course import ModuleCourse
    from models.learn.module_skill import ModuleSkill
    from models.learn.assigned_courses import AssignedCourse
    from models.learn.assigned_skill import AssignedSkill
    from datetime import datetime

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
            .filter_by(user_id=user_id, module_id=module_id, status="assigned")
            .first()
        )
        if not assigned_module:
            continue

        # Check if all module courses are completed
        all_courses = db.query(ModuleCourse).filter_by(module_id=module_id).all()
        all_course_ids = [c.course_id for c in all_courses]
        completed_courses = db.query(AssignedCourse).filter(
            AssignedCourse.user_id == user_id,
            AssignedCourse.course_id.in_(all_course_ids),
            AssignedCourse.status == "completed"
        ).count()

        # Check if all module skills are completed
        all_skills = db.query(ModuleSkill).filter_by(module_id=module_id).all()
        all_skill_ids = [s.skill_id for s in all_skills]
        completed_skills = db.query(AssignedSkill).filter(
            AssignedSkill.user_id == user_id,
            AssignedSkill.skill_id.in_(all_skill_ids),
            AssignedSkill.status == "completed"
        ).count()

        if completed_courses == len(all_course_ids) and completed_skills == len(all_skill_ids):
            assigned_module.status = "completed"
            assigned_module.completed_at = datetime.utcnow()
            db.commit()
