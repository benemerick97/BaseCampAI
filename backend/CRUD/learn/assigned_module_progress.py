from sqlalchemy.orm import Session
from models.learn.assigned_module_progress import AssignedModuleProgress
from models.learn.assigned_module import AssignedModule
from schemas.learn.assigned_module_progress import AssignedModuleProgressCreate
from datetime import datetime

def create_progress_item(db: Session, data: AssignedModuleProgressCreate) -> AssignedModuleProgress:
    item = AssignedModuleProgress(
        assigned_module_id=data.assigned_module_id,
        item_type=data.item_type,
        item_id=data.item_id,
        status="assigned"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def complete_progress_item_with_module_status(db: Session, item_id: int):
    item = db.query(AssignedModuleProgress).get(item_id)
    if not item:
        return None, None

    if item.status != "completed":
        item.status = "completed"
        item.completed_at = datetime.utcnow()
        db.commit()

    # Check if the entire module is now completed
    assigned_module_id = item.assigned_module_id
    all_items = db.query(AssignedModuleProgress).filter(
        AssignedModuleProgress.assigned_module_id == assigned_module_id
    ).all()

    module_complete = all(i.status == "completed" for i in all_items)

    module = db.query(AssignedModule).get(assigned_module_id)
    if module_complete and module.status != "completed":
        module.status = "completed"
        module.completed_at = datetime.utcnow()
        db.commit()

    db.refresh(item)
    db.refresh(module)
    return item, module

def get_progress_for_module(db: Session, assigned_module_id: int) -> list[AssignedModuleProgress]:
    return db.query(AssignedModuleProgress).filter(
        AssignedModuleProgress.assigned_module_id == assigned_module_id
    ).all()


def get_progress_for_user(db: Session, user_id: int) -> list[AssignedModuleProgress]:
    return db.query(AssignedModuleProgress).join(
        AssignedModule, AssignedModule.id == AssignedModuleProgress.assigned_module_id
    ).filter(AssignedModule.user_id == user_id).all()


def get_module_progress_percentage(db: Session, assigned_module_id: int) -> float:
    items = db.query(AssignedModuleProgress).filter(
        AssignedModuleProgress.assigned_module_id == assigned_module_id
    ).all()

    if not items:
        return 0.0

    completed = sum(1 for item in items if item.status == "completed")
    return round((completed / len(items)) * 100, 2)
