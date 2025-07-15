# routes/work/workflow.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from schemas.work.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowOut
)
from CRUD.work.workflow import (
    create_workflow,
    list_workflows,
    get_workflow,
    update_workflow,
    delete_workflow,
    save_draft_workflow,
    autosave_workflow,
    publish_workflow
)
from databases.database import get_db
from dependencies.org import get_org_id

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("/", response_model=WorkflowOut)
def create_workflow_route(
    data: WorkflowCreate,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    return create_workflow(db, data, organisation_id)


@router.get("/", response_model=List[WorkflowOut])
def list_workflows_route(
    is_template: Optional[bool] = None,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    return list_workflows(db, organisation_id, is_template)


@router.get("/{workflow_id}", response_model=WorkflowOut)
def get_workflow_route(
    workflow_id: int,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    workflow = get_workflow(db, workflow_id, organisation_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowOut)
def update_workflow_route(
    workflow_id: int,
    data: WorkflowUpdate,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    updated = update_workflow(db, workflow_id, data, organisation_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return updated


@router.patch("/{workflow_id}/autosave", response_model=WorkflowOut)
def autosave_workflow_route(
    workflow_id: int,
    partial_data: dict,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    result = autosave_workflow(db, workflow_id, organisation_id, partial_data)
    if not result:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return result


@router.post("/save_draft", response_model=WorkflowOut)
def save_draft_workflow_route(
    data: WorkflowCreate,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    return save_draft_workflow(db, data, organisation_id)


@router.post("/{workflow_id}/publish", response_model=WorkflowOut)
def publish_workflow_route(
    workflow_id: int,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    result = publish_workflow(db, workflow_id, organisation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return result


@router.delete("/{workflow_id}")
def delete_workflow_route(
    workflow_id: int,
    db: Session = Depends(get_db),
    organisation_id: int = Depends(get_org_id)
):
    deleted = delete_workflow(db, workflow_id, organisation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted"}
