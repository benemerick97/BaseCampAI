# backend/CRUD/document.py

from sqlalchemy.orm import Session
from models.document_object import DocumentObject
from models.document_file import DocumentFile
from models.agent_document import AgentDocument
from schemas.document import DocumentObjectCreate
import uuid
from datetime import datetime

# -------------------------------
# DOCUMENT OBJECTS
# -------------------------------

def create_document_object(db: Session, data: DocumentObjectCreate) -> DocumentObject:
    doc = DocumentObject(
        id=uuid.uuid4(),
        name=data.name,
        org_id=data.org_id,
        review_date=data.review_date
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def get_document_object(db: Session, doc_id: uuid.UUID) -> DocumentObject | None:
    return db.query(DocumentObject).filter(DocumentObject.id == doc_id).first()

def list_document_objects_by_org(db: Session, org_id: str) -> list[DocumentObject]:
    return db.query(DocumentObject).filter(DocumentObject.org_id == org_id).all()

def update_current_file_reference(db: Session, doc: DocumentObject, file_id: uuid.UUID) -> DocumentObject:
    doc.current_file_id = file_id
    doc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(doc)
    return doc

def delete_document_object(db: Session, doc_id: uuid.UUID) -> None:
    doc = db.query(DocumentObject).filter(DocumentObject.id == doc_id).first()
    if doc:
        db.delete(doc)
        db.commit()

# -------------------------------
# DOCUMENT FILES
# -------------------------------

def add_document_file_version(
    db: Session,
    document_id: uuid.UUID,
    file_path: str,
    original_filename: str,
    version: int
) -> DocumentFile:
    new_file = DocumentFile(
        document_id=document_id,
        file_path=file_path,
        original_filename=original_filename,
        version=version
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return new_file

def get_latest_file_version(db: Session, document_id: uuid.UUID) -> int:
    latest = (
        db.query(DocumentFile)
        .filter(DocumentFile.document_id == document_id)
        .order_by(DocumentFile.version.desc())
        .first()
    )
    return latest.version if latest else 0

# -------------------------------
# AGENT-DOCUMENT ASSIGNMENT
# -------------------------------

def assign_document_to_agent(db: Session, agent_id: str, document_id: uuid.UUID) -> None:
    link = AgentDocument(agent_id=agent_id, document_id=document_id)
    db.add(link)
    db.commit()

def unassign_document_from_agent(db: Session, agent_id: str, document_id: uuid.UUID) -> None:
    db.query(AgentDocument).filter(
        AgentDocument.agent_id == agent_id,
        AgentDocument.document_id == document_id
    ).delete()
    db.commit()

def list_documents_for_agent(db: Session, agent_id: str) -> list[uuid.UUID]:
    return [row.document_id for row in db.query(AgentDocument).filter(AgentDocument.agent_id == agent_id).all()]
