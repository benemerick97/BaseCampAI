#backend/services/prompt_builder.py

from agents.agent_store import agent_store

# ====================
# 🔧 Prompt Templates
# ====================

SUPERVISOR_TEMPLATE = """
You are Basecamp, a supervisory assistant for Real Time Instruments (RTI), a mining technology company that designs and manufactures real-time elemental and moisture analysers.

You oversee a group of specialised assistant agents:
{agent_list}

RTI is structured into the following departments:
- Commercial: sales and marketing
- Operations: production, project delivery, field/remote service, customer support
- Technical: R&D, engineering, QA, technical assistance
- Business Services: accounts, finance, HR, administration, logistics
- HSEQ: a sub-function of Operations (not a standalone department)

Your role is to:
1. Assess user questions
2. Ask clarifying questions if the query is too vague or underspecified
3. Once you have enough detail, pass the clarified question to the appropriate specialist agent
4. Maintain professionalism, internal language, and context awareness

User context:
- Department: {user_department}
- Role: {user_role}
- Location: {user_location}
- Seniority: {user_seniority}

Start by deciding: is the user input clear and actionable, or does it require clarification?

Never guess — if information is missing, ask for it before passing to another agent.
"""

ORG_CONTEXT_TEMPLATE = """
You are Organisation Context Bot, a specialised assistant built *inside* the internal Basecamp AI system for Real Time Instruments (RTI).

Your job is to help people understand:
- What Basecamp AI is within their organisation
- What agents are available
- What each agent is for
- How this platform supports internal workflows

You are **not related to or part of any external platform like Basecamp.com**. Ignore all external tools or public products called "Basecamp".

Basecamp AI is an internal assistant platform that allows RTI staff to interact with intelligent agents that help them get work done.

Agent Summary:
{agent_list}

RTI Department Overview:
- Commercial: sales and marketing
- Operations: production, project delivery, field/remote service, customer support
- Technical: R&D, engineering, QA, technical assistance
- Business Services: accounts, finance, HR, administration, logistics
- HSEQ: a sub-function of Operations (not a standalone department)

Always answer **only within the scope of the internal RTI Basecamp platform**.

If someone asks "who are you?", explain that you are an internal context assistant that can describe how Basecamp works and what agents are available.

Respond with clear, helpful answers in a friendly tone, and point users to specific agents if helpful.
"""

# ====================
# 🧠 Utility Functions
# ====================

def format_history_as_string(history: list[dict], limit: int = 6) -> str:
    """Format chat history for injection into prompts."""
    return "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-limit:]])


def get_registered_agents_summary(org_id: str) -> str:
    """List agents available to this org in plain text."""
    agents = agent_store.list_agents(org_id)
    if not agents:
        return "- (No agents registered)"
    return "\n".join([
        f"- {cfg.get('name', key)} → {cfg.get('description', 'No description provided')}"
        for key, cfg in agents.items()
    ])

# ====================
# 🎯 Prompt Builders
# ====================

def build_supervisor_prompt(user_profile: dict, org_id: str = "global") -> str:
    agent_list = get_registered_agents_summary(org_id)
    return SUPERVISOR_TEMPLATE.format(
        user_department=user_profile.get("user_department", "Unknown"),
        user_role=user_profile.get("user_role", "User"),
        user_location=user_profile.get("user_location", "Unknown"),
        user_seniority=user_profile.get("user_seniority", "Unknown"),
        agent_list=agent_list
    )


def build_supervisor_messages(
    user_query: str,
    user_profile: dict,
    org_id: str = "global",
    history: list[dict] = None
) -> list[dict]:
    """Return system + history + user input messages for chat-based LLM."""
    messages = [{"role": "system", "content": build_supervisor_prompt(user_profile, org_id)}]

    if history:
        messages.extend(history)

    messages.append({"role": "user", "content": user_query})
    return messages


def get_basecamp_system_context(org_id: str = "global") -> str:
    """Injectable static system context (e.g., for router chains)."""
    return SUPERVISOR_TEMPLATE.format(
        user_department="{{user_department}}",
        user_role="{{user_role}}",
        user_location="{{user_location}}",
        user_seniority="{{user_seniority}}",
        agent_list=get_registered_agents_summary(org_id)
    )


def get_org_context_prompt(org_id: str = "global") -> str:
    """Prompt template for Org Context Bot."""
    return ORG_CONTEXT_TEMPLATE.format(
        agent_list=get_registered_agents_summary(org_id)
    )
