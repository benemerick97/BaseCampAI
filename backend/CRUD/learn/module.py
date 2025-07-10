from sqlalchemy.orm import Session
from uuid import UUID
from models.learn.module import Module
from models.learn.module_course import ModuleCourse
from models.learn.module_skill import ModuleSkill
from schemas.learn.module import ModuleCreate, ModuleUpdate
from models.learn.skill import Skill
from models.learn.course import Course

def create_module(db: Session, module_data: ModuleCreate, org_id: UUID) -> Module:
    module = Module(
        name=module_data.name,
        description=module_data.description,
        org_id=org_id,
        document_id=module_data.document_id,
    )
    db.add(module)
    db.flush()

    for course_id in module_data.course_ids:
        db.add(ModuleCourse(module_id=module.id, course_id=course_id))

    for skill_id in module_data.skill_ids:
        db.add(ModuleSkill(module_id=module.id, skill_id=skill_id))

    db.commit()
    db.refresh(module)
    return module

def get_module(db: Session, module_id: UUID) -> Module:
    return db.query(Module).filter(Module.id == module_id).first()

def get_all_modules(db: Session, org_id: UUID) -> list[Module]:
    return db.query(Module).filter(Module.org_id == org_id).all()

def update_module(db: Session, module_id: UUID, updates: ModuleUpdate, org_id: UUID) -> Module:
    module = get_module(db, module_id)
    if not module or module.org_id != org_id:
        return None

    if updates.name is not None:
        module.name = updates.name
    if updates.description is not None:
        module.description = updates.description
    if updates.document_id is not None:
        module.document_id = updates.document_id

    if updates.course_ids is not None:
        db.query(ModuleCourse).filter(ModuleCourse.module_id == module_id).delete()
        for cid in updates.course_ids:
            db.add(ModuleCourse(module_id=module_id, course_id=cid))

    if updates.skill_ids is not None:
        db.query(ModuleSkill).filter(ModuleSkill.module_id == module_id).delete()
        for sid in updates.skill_ids:
            db.add(ModuleSkill(module_id=module_id, skill_id=sid))

    db.commit()
    db.refresh(module)
    return module

def delete_module(db: Session, module_id: UUID):
    module = get_module(db, module_id)
    if module:
        db.delete(module)
        db.commit()


def get_module_skills(db: Session, module_id: UUID):
    return (
        db.query(Skill)
        .join(ModuleSkill, Skill.id == ModuleSkill.skill_id)
        .filter(ModuleSkill.module_id == module_id)
        .all()
    )

def get_module_courses(db: Session, module_id: UUID):
    return (
        db.query(Course)
        .join(ModuleCourse, Course.id == ModuleCourse.course_id)
        .filter(ModuleCourse.module_id == module_id)
        .all()
    )