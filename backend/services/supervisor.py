# backend/services/supervisor.py

import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from agents.router import build_router_chain
from agents.agent_store import agent_store
from services.agent_evaluator import evaluate_agent
from services.summariser import summarise_across_agents
from services.clarification_handler import (
    is_input_vague,
    get_clarifier_chain,
)
from utils.logger import logger
from utils.prompt_logger import log_prompt  # ✅ New: Logging function

load_dotenv()

# In-memory session store
session_state = {}

def get_session_state(session_id: str) -> dict:
    return session_state.setdefault(session_id, {
        "clarifying": False,
        "clarification_pending": "",
        "history": [],
        "last_agent": None,
        "followup_expected": False,
    })


async def handle_supervised_stream(
    user_input: str,
    session_id: str,
    org_id: str,
    user_profile: dict,
    stream_handler=None
):
    logger.debug(f"[Session {session_id}] Input received: '{user_input}'")
    state = get_session_state(session_id)
    history = state["history"]
    history.append({"role": "user", "content": user_input})

    # Step 1: Clarification check
    if state["clarifying"]:
        user_input = f"{state['clarification_pending']} {user_input}"
        state["clarifying"] = False
        state["clarification_pending"] = ""
    elif is_input_vague(user_input, history) and not state["followup_expected"]:
        clarification = get_clarifier_chain(org_id).invoke({"input": user_input}).strip()
        state["clarifying"] = True
        state["clarification_pending"] = user_input
        history.append({"role": "assistant", "content": clarification})
        logger.debug(f"[Clarification Requested] {clarification}")
        yield clarification
        return

    state["followup_expected"] = False

    # Step 2: Load agent chains
    try:
        destination_chains = build_router_chain(org_id, history=history)
    except Exception as e:
        logger.error(f"[Router Error] Failed to build agent chains: {e}")
        yield "[System error] Could not initialise routing."
        return

    logger.info(f"[Supervisor] Agents available: {list(destination_chains.keys())}")
    agents = agent_store.list_agents(org_id)

    # Step 3: Evaluate all agents (excluding general fallback)
    evaluation_tasks = [
        evaluate_agent(agent_key, user_input, org_id, destination_chains[agent_key])
        for agent_key in destination_chains
        if agent_key in agents and agent_key != "general_knowledge_bot"
    ]

    evaluations = await asyncio.gather(*evaluation_tasks)

    # ✅ Step 4: Log all agents regardless of score
    await log_prompt(org_id, session_id, user_input, evaluations)

    # ✅ Step 5: Filter relevant agents (score >= 0.7)
    relevant_agents = [r for r in evaluations if r["score"] >= 0.7]

    # Step 6: Decide routing strategy
    if not relevant_agents:
        destination_key = "general_knowledge_bot"
        chain = destination_chains.get(destination_key)
        logger.info("[Routing] No relevant agents. Using general_knowledge_bot.")
    elif len(relevant_agents) == 1:
        best = relevant_agents[0]
        destination_key = best["agent_key"]
        chain = best["chain"]
        logger.info(f"[Routing] Selected agent: {destination_key} (score: {best['score']:.3f})")
    else:
        logger.info(f"[Routing] Multiple agents matched. Summarising across: {[r['agent_key'] for r in relevant_agents]}")
        full_response = ""
        async for chunk in summarise_across_agents(user_input, relevant_agents, stream_handler):
            full_response += chunk
            yield chunk
        history.append({"role": "assistant", "content": full_response})
        state["last_agent"] = "multi_summary"
        return

    # Step 7: Run the selected agent chain
    try:
        payload = {"input": user_input}
        full_response = ""

        if hasattr(chain, "astream"):
            async for chunk in chain.astream(payload):
                text = getattr(chunk, "content", None) or str(chunk)
                full_response += text
                yield text
        else:
            result = await chain.ainvoke(payload)
            full_response = (
                result.get("output") if isinstance(result, dict) and "output" in result
                else result.content if hasattr(result, "content")
                else str(result)
            )
            yield full_response

        # Step 8: Save response
        history.append({"role": "assistant", "content": full_response})
        state["last_agent"] = destination_key
        state["followup_expected"] = destination_key == "general_knowledge_bot"

    except Exception as e:
        logger.error(f"[Agent Error] {e}")
        yield f"[Agent error] Failed during response streaming: {str(e)}"
