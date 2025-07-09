from sqlalchemy.orm import Session
from models.learn.assigned_module import AssignedModule
from schemas.learn.assigned_module import AssignedModuleCreate
from datetime import datetime

def assign_module(db: Session, data: AssignedModuleCreate) -> AssignedModule:
    assigned = AssignedModule(
        user_id=data.user_id,
        module_id=data.module_id,
        assigned_at=datetime.utcnow(),
        status="assigned"
    )
    db.add(assigned)
    db.commit()
    db.refresh(assigned)
    return assigned

def get_user_modules(db: Session, user_id: int) -> list[AssignedModule]:
    return db.query(AssignedModule).filter(AssignedModule.user_id == user_id).all()

def complete_module(db: Session, assigned_module_id: int) -> AssignedModule:
    assigned = db.query(AssignedModule).get(assigned_module_id)
    if assigned:
        assigned.status = "completed"
        assigned.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(assigned)
    return assigned
