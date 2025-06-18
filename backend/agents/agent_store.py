# agents/agent_store.py

from typing import Dict, Optional
import json
from sqlalchemy.orm import Session
from databases.database import get_db
from agents.agent_service import register_agent as db_register_agent, get_agent, list_agents, Agent
from contextlib import contextmanager

# Static agents like general_knowledge_bot
STATIC_AGENTS: Dict[str, dict] = {}

@contextmanager
def get_db_session():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


class AgentStore:
    def __init__(self):
        pass  # No in-memory cache anymore

    def register_agent(
        self,
        org_id: str,
        agent_key: str,
        name: str,
        description: str,
        prompt: str,
        filter: dict,
        type: str = "prompt",
    ) -> None:
        # Register global system agents in memory only
        if org_id == "global":
            STATIC_AGENTS[agent_key] = {
                "name": name,
                "description": description,
                "prompt": prompt,
                "filter": filter,
                "type": type,
            }
            return

        with get_db_session() as db:
            db_register_agent(
                db=db,
                org_id=int(org_id),
                agent_key=agent_key,
                name=name,
                description=description,
                prompt=prompt,
                filter_dict=filter,
                type=type,
            )

    def get_agent_config(self, org_id: str, agent_key: str) -> Optional[dict]:
        if org_id == "global" and agent_key in STATIC_AGENTS:
            return STATIC_AGENTS[agent_key]

        with get_db_session() as db:
            return get_agent(db, int(org_id), agent_key)

    def list_agents(self, org_id: str) -> Dict[str, dict]:
        with get_db_session() as db:
            db_agents = list_agents(db, int(org_id))

        if org_id == "global":
            return {**STATIC_AGENTS, **db_agents}
        return db_agents

    def has_agent(self, org_id: str, agent_key: str) -> bool:
        if org_id == "global" and agent_key in STATIC_AGENTS:
            return True
        with get_db_session() as db:
            return get_agent(db, int(org_id), agent_key) is not None


# ✅ Singleton
agent_store = AgentStore()

# ✅ Register static agent
agent_store.register_agent(
    org_id="global",
    agent_key="general_knowledge_bot",
    name="General Knowledge Bot",
    description="Answers general questions, tells jokes, shares trivia, and responds playfully to common queries.",
    prompt=(
        "You are General Knowledge Bot, a friendly and helpful assistant who responds to general questions, "
        "tells light-hearted jokes, shares fun trivia, and engages users in an informative and approachable tone.\n\n"
        "Follow these rules:\n"
        "- Answer clearly and conversationally.\n"
        "- If the question is lighthearted (like a joke, fun fact, or trivia), keep your tone playful.\n"
        "- If the question is general knowledge (like 'what is the capital of Peru'), give a clear factual answer.\n"
        "- If the question is outside your scope or can't be answered with confidence, politely say so.\n"
        "- Do NOT try to answer organisation-specific questions. Politely redirect those with: "
        "\"I'm better at general knowledge! You might want to ask one of the other specialist agents.\"\n\n"
        "User: {input}\nAssistant:"
    ),
    filter={"agent_id": "general_knowledge_bot"},
    type="system",
)
