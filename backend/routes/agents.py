from fastapi import APIRouter, Header, HTTPException, status, Path
from pydantic import BaseModel
from typing import Optional, List, Dict

from agents.agent_store import agent_store

router = APIRouter()


# 📦 Request model
class AgentDefinition(BaseModel):
    agent_key: str
    name: str
    description: str
    prompt: str
    filter: Dict


# 📤 Response model
class AgentSummary(BaseModel):
    key: str
    name: str
    description: str


# 🚀 Register a new agent
@router.post("/agents/register", status_code=status.HTTP_201_CREATED)
def register_agent(
    defn: AgentDefinition,
    x_org_id: Optional[str] = Header(None)
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
            filter=defn.filter
        )
        return {"status": "success", "agent_key": defn.agent_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📥 List all agents for an org
@router.get("/agents", response_model=Dict[str, List[AgentSummary]])
def list_agents(x_org_id: Optional[str] = Header(None)):
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    agents = agent_store.list_agents(x_org_id)

    agent_list = [
        AgentSummary(key=key, name=config["name"], description=config["description"])
        for key, config in agents.items()
    ]

    return {"agents": agent_list}


# ✏️ Update an existing agent
@router.put("/agents/{agent_key}")
def update_agent(
    agent_key: str = Path(...),
    defn: AgentDefinition = ...,
    x_org_id: Optional[str] = Header(None)
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
            filter=defn.filter
        )
        return {"status": "updated", "agent_key": agent_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📄 Get full agent config
@router.get("/agents/{agent_key}")
def get_agent(agent_key: str, x_org_id: Optional[str] = Header(None)):
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
    }


# 🗑️ Delete an agent
@router.delete("/agents/{agent_key}")
def delete_agent(agent_key: str, x_org_id: Optional[str] = Header(None)):
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing 'x-org-id' header.")

    if not agent_store.has_agent(x_org_id, agent_key):
        raise HTTPException(status_code=404, detail="Agent not found.")

    try:
        del agent_store.agents[x_org_id][agent_key]
        return {"status": "deleted", "agent_key": agent_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
