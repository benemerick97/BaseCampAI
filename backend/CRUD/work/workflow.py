# crud/work/workflow.py

from sqlalchemy.orm import Session
from models.work.workflow import Workflow, Step, InputField, StepGroup
from schemas.work.workflow import WorkflowCreate


def create_workflow(db: Session, data: WorkflowCreate, organisation_id: int):
    workflow = Workflow(
        name=data.name,
        description=data.description,
        is_template=data.is_template,
        organisation_id=organisation_id
    )
    db.add(workflow)
    db.flush()  # get workflow.id

    # Create groups
    group_id_map = {}  # for optional mapping to reuse in steps
    for idx, group_data in enumerate(data.groups):
        group = StepGroup(
            name=group_data.name,
            order=group_data.order,
            workflow_id=workflow.id
        )
        db.add(group)
        db.flush()
        group_id_map[idx] = group.id  # if using index or reference key

    # Create steps and inputs
    for step_data in data.steps:
        step = Step(
            workflow_id=workflow.id,
            title=step_data.title,
            instructions=step_data.instructions,
            order=step_data.order,
            group_id=group_id_map.get(step_data.group_index)

        )
        db.add(step)
        db.flush()
        for input_data in step_data.inputs:
            input_field = InputField(
                step_id=step.id,
                label=input_data.label,
                input_type=input_data.input_type,
                options=input_data.options,
                required=input_data.required,
            )
            db.add(input_field)

    db.commit()
    db.refresh(workflow)
    return workflow


def list_workflows(db: Session, organisation_id: int, is_template: bool = None):
    query = db.query(Workflow).filter(Workflow.organisation_id == organisation_id)
    if is_template is not None:
        query = query.filter(Workflow.is_template == is_template)
    return query.all()


def get_workflow(db: Session, workflow_id: int, organisation_id: int):
    return db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.organisation_id == organisation_id
    ).first()


def update_workflow(db: Session, workflow_id: int, data: WorkflowCreate, organisation_id: int):
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.organisation_id == organisation_id
    ).first()
    if not workflow:
        return None

    workflow.name = data.name
    workflow.description = data.description
    workflow.is_template = data.is_template

    # Delete old steps and inputs
    db.query(InputField).filter(InputField.step_id.in_(
        db.query(Step.id).filter(Step.workflow_id == workflow_id)
    )).delete(synchronize_session=False)

    db.query(Step).filter(Step.workflow_id == workflow_id).delete(synchronize_session=False)

    # Delete old groups
    db.query(StepGroup).filter(StepGroup.workflow_id == workflow_id).delete(synchronize_session=False)

    db.flush()

    # Recreate groups
    group_id_map = {}
    for idx, group_data in enumerate(data.groups):
        group = StepGroup(
            name=group_data.name,
            order=group_data.order,
            workflow_id=workflow.id
        )
        db.add(group)
        db.flush()
        group_id_map[idx] = group.id

    # Recreate steps
    for step_data in data.steps:
        step = Step(
            workflow_id=workflow.id,
            title=step_data.title,
            instructions=step_data.instructions,
            order=step_data.order,
            group_id=group_id_map.get(step_data.group_index)
        )
        db.add(step)
        db.flush()
        for input_data in step_data.inputs:
            input_field = InputField(
                step_id=step.id,
                label=input_data.label,
                input_type=input_data.input_type,
                options=input_data.options,
                required=input_data.required,
            )
            db.add(input_field)

    db.commit()
    db.refresh(workflow)
    return workflow


def delete_workflow(db: Session, workflow_id: int, organisation_id: int):
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.organisation_id == organisation_id
    ).first()
    if not workflow:
        return None

    db.delete(workflow)
    db.commit()
    return workflow
