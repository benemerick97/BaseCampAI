# backend/routes/agents.py

from fastapi import APIRouter, Header, HTTPException, status, Path, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict

from agents.agent_store import agent_store
from agents.agent_service import delete_agent as db_delete_agent
from databases.database import get_db
from sqlalchemy.orm import Session
from schemas.document import AgentDocumentLink, DocumentObjectRead
from CRUD.document import assign_document_to_agent, unassign_document_from_agent, list_documents_for_agent
from models.document_object import DocumentObject

router = APIRouter()

# 📦 Request model
class AgentDefinition(BaseModel):
    agent_key: str
    name: str
    description: str
    prompt: str
    filter: Dict
    type: str  # "prompt", "retrieval", "system"

# 📤 Response model
class AgentSummary(BaseModel):
    key: str
    name: str
    description: str
    type: str

# 🚀 Register a new agent
@router.post("/agents/register", status_code=status.HTTP_201_CREATED)
def register_agent(
    defn: AgentDefinition,
    x_org_id: Optional[int] = Header(None)  # ✅ Changed to int
):
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    if agent_store.has_agent(x_org_id, defn.agent_key):
        raise HTTPException(
            status_code=409,
            detail=f"Agent '{defn.agent_key}' already exists for org '{x_org_id}'."
        )

    try:
        agent_store.register_agent(
            org_id=x_org_id,
            agent_key=defn.agent_key,
            name=defn.name,
            description=defn.description,
            prompt=defn.prompt,
            filter=defn.filter,
            type=defn.type
        )
        return {"status": "success", "agent_key": defn.agent_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📥 List all agents for an org
@router.get("/agents", response_model=Dict[str, List[AgentSummary]])
def list_agents(x_org_id: Optional[int] = Header(None)):  # ✅ Changed to int
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    agents = agent_store.list_agents(x_org_id)

    agent_list = [
        AgentSummary(
            key=key,
            name=config["name"],
            description=config["description"],
            type=config["type"]
        )
        for key, config in agents.items()
    ]

    return {"agents": agent_list}

# ✏️ Update an existing agent
@router.put("/agents/{agent_key}")
def update_agent(
    agent_key: str = Path(...),
    defn: AgentDefinition = ...,
    x_org_id: Optional[int] = Header(None)  # ✅ Changed to int
):
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    if not agent_store.has_agent(x_org_id, agent_key):
        raise HTTPException(status_code=404, detail="Agent not found.")

    try:
        agent_store.register_agent(
            org_id=x_org_id,
            agent_key=agent_key,
            name=defn.name,
            description=defn.description,
            prompt=defn.prompt,
            filter=defn.filter,
            type=defn.type
        )
        return {"status": "updated", "agent_key": agent_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📄 Get full agent config
@router.get("/agents/{agent_key}")
def get_agent(agent_key: str, x_org_id: Optional[int] = Header(None)):  # ✅ Changed to int
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    config = agent_store.get_agent_config(x_org_id, agent_key)
    if not config:
        raise HTTPException(status_code=404, detail="Agent not found.")

    return {
        "agent_key": agent_key,
        "name": config["name"],
        "description": config["description"],
        "prompt": config["prompt"],
        "filter": config["filter"],
        "type": config["type"]
    }

# 🗑️ Delete an agent
@router.delete("/agents/{agent_key}")
def delete_agent(
    agent_key: str,
    x_org_id: Optional[int] = Header(None),  # ✅ Changed to int
    db: Session = Depends(get_db)
):
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    deleted = db_delete_agent(db, x_org_id, agent_key)
    if not deleted:
        raise HTTPException(status_code=404, detail="Agent not found.")

    return {"status": "deleted", "agent_key": agent_key}

# 📎 Assign document
@router.post("/agents/{agent_id}/documents")
def assign_document(
    agent_id: str,
    link: AgentDocumentLink,
    db: Session = Depends(get_db)
):
    try:
        assign_document_to_agent(db, agent_id=agent_id, document_id=link.document_id)
        return {"status": "assigned", "agent_id": agent_id, "document_id": str(link.document_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ❌ Unassign document
@router.delete("/agents/{agent_id}/documents/{document_id}")
def unassign_document(
    agent_id: str,
    document_id: str,
    db: Session = Depends(get_db)
):
    try:
        unassign_document_from_agent(db, agent_id=agent_id, document_id=document_id)
        return {"status": "unassigned", "agent_id": agent_id, "document_id": document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📄 List documents for agent
@router.get("/agents/{agent_id}/documents", response_model=List[DocumentObjectRead])
def list_docs_for_agent(
    agent_id: str,
    db: Session = Depends(get_db)
):
    doc_ids = list_documents_for_agent(db, agent_id)
    docs = db.query(DocumentObject).filter(DocumentObject.id.in_(doc_ids)).all()
    return docs
