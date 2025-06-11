# agents/agent_store.py

from typing import Dict, Optional

class AgentStore:
    def __init__(self):
        # Structure: {org_id: {agent_key: agent_config_dict}}
        self.agents: Dict[str, Dict[str, dict]] = {}

    def register_agent(
        self,
        org_id: str,
        agent_key: str,
        name: str,
        description: str,
        prompt: str,
        filter: dict,
    ) -> None:
        """Register an agent configuration under a specific org."""
        self.agents.setdefault(org_id, {})[agent_key] = {
            "name": name,
            "description": description,
            "prompt": prompt,
            "filter": filter,
        }

    def get_agent_config(self, org_id: str, agent_key: str) -> Optional[dict]:
        """Retrieve an agent config, with fallback to global org."""
        return (
            self.agents.get(org_id, {}).get(agent_key)
            or self.agents.get("global", {}).get(agent_key)
        )

    def list_agents(self, org_id: str) -> Dict[str, dict]:
        """Return merged agents for the org, falling back to global if needed."""
        org_agents = self.agents.get(org_id, {})
        global_agents = self.agents.get("global", {})
        return {**global_agents, **org_agents}

    def has_agent(self, org_id: str, agent_key: str) -> bool:
        """Check if an agent exists in org or global fallback."""
        return agent_key in self.agents.get(org_id, {}) or agent_key in self.agents.get("global", {})

# ✅ Shared singleton instance
agent_store = AgentStore()

# ✅ Global default agents
agent_store.register_agent(
    org_id="global",
    agent_key="support_bot",
    name="Support Bot",
    description="Handles IT, access, and internal tool support.",
    prompt="You are Support Bot. Help users with their IT and internal tool issues. Answer clearly and concisely.\n\nUser: {input}\nSupport Bot:",
    filter={"agent_id": "support_bot"},
)

agent_store.register_agent(
    org_id="global",
    agent_key="compliance_bot",
    name="Compliance Bot",
    description=(
        "Answers questions about internal documentation, compliance processes, activity logging guidelines, "
        "safety policies, regulations, and formal procedures (e.g., HubSpot logging, audit trails, and approval workflows)."
    ),
    prompt=(
        "You are Compliance Bot, a knowledgeable assistant trained on official internal documentation. "
        "Your job is to help users understand policies, safety guidelines, activity logging procedures, and formal compliance processes.\n\n"
        "Use the provided document context to answer the question as clearly as possible.\n"
        "If the user asks for a summary, generate a useful summary even if the document doesn’t use the exact same wording.\n"
        "If no context is provided at all, politely let the user know.\n\n"
        "User: {input}\nCompliance Bot:"
    ),
    filter={"agent_id": "compliance_bot"},
)


# ✅ Organisation context agent with dynamic context
agent_store.register_agent(
    org_id="global",
    agent_key="org_context_bot",
    name="Organisation Context Bot",
    description="Answers questions about how your organisation uses Basecamp, including agent roles and system structure.",
    prompt="You are Organisation Context Bot. Help the user understand how Basecamp works internally. [DYNAMIC PROMPT]",  # placeholder
    filter={"agent_id": "org_context_bot"},
)

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
)
