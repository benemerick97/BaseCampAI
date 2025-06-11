# backend/agents/router.py

import os
from typing import Dict, Union
from dotenv import load_dotenv

from langchain_core.runnables import Runnable
from agents.agent_store import agent_store
from agents.build_agent import build_agent_chain
from utils.logger import logger

def build_router_chain(org_id: str, history: list[dict] = None) -> Dict[str, Runnable]:
    load_dotenv()
    logger.info(f"[Router Init] Building agent chains for org_id: '{org_id}'")

    agents = agent_store.list_agents(org_id)
    if not agents:
        raise ValueError(f"No agents registered for org_id '{org_id}'.")

    destination_chains: Dict[str, Runnable] = {}

    for agent_key, config in agents.items():
        if not config.get("prompt") or not config.get("description"):
            logger.warning(f"[Router Skipped] Agent '{agent_key}' missing prompt or description.")
            continue

        try:
            chain = build_agent_chain(
                agent_key=agent_key,
                org_id=org_id,
                history=history,
                use_memory=False  # ✅ force document-based response
            )

            if hasattr(chain, "ainvoke") and hasattr(chain, "astream"):
                destination_chains[agent_key] = chain
                logger.debug(f"[Router Loaded] Agent: {agent_key}")
            else:
                logger.error(f"[Router Error] Agent '{agent_key}' missing required methods.")
        except Exception as e:
            logger.error(f"[Router Load Error] Agent '{agent_key}' → {e}")

    if not destination_chains:
        raise ValueError("No valid agent chains built for routing.")

    logger.info(f"[Router Ready] Loaded agents: {list(destination_chains.keys())}")
    return destination_chains
