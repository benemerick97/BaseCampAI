# agents/agent_service.py

from sqlalchemy.orm import Session
from models.agent import Agent
import json


def register_agent(
    db: Session,
    org_id: int,
    agent_key: str,
    name: str,
    description: str,
    prompt: str,
    filter_dict: dict,
    type: str
):
    agent = db.query(Agent).filter_by(org_id=org_id, agent_key=agent_key).first()
    if agent:
        # Update existing agent
        agent.name = name
        agent.description = description
        agent.prompt = prompt
        agent.filter = json.dumps(filter_dict)
        agent.type = type
    else:
        # Create new agent
        agent = Agent(
            org_id=org_id,
            agent_key=agent_key,
            name=name,
            description=description,
            prompt=prompt,
            filter=json.dumps(filter_dict),
            type=type,
        )
        db.add(agent)
    db.commit()


def get_agent(db: Session, org_id: int, agent_key: str):
    agent = db.query(Agent).filter_by(org_id=org_id, agent_key=agent_key).first()
    if agent:
        return {
            "name": agent.name,
            "description": agent.description,
            "prompt": agent.prompt,
            "filter": json.loads(agent.filter),
            "type": agent.type,
        }
    return None


def list_agents(db: Session, org_id: int):
    agents = db.query(Agent).filter(Agent.org_id == org_id).all()
    return {
        agent.agent_key: {
            "name": agent.name,
            "description": agent.description,
            "prompt": agent.prompt,
            "filter": json.loads(agent.filter),
            "type": agent.type,
        }
        for agent in agents
    }


def delete_agent(db: Session, org_id: int, agent_key: str):
    agent = db.query(Agent).filter_by(org_id=org_id, agent_key=agent_key).first()
    if agent:
        db.delete(agent)
        db.commit()
        return True
    return False
