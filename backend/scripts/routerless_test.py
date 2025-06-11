# backend/scripts/routerless_test.py

import asyncio
import sys
import os

# 👇 Add workspace root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from agents.build_agent import build_agent_chain
from langchain_core.runnables import RunnableConfig


async def test_direct_agent():
    org_id = "1"
    agent_key = "compliance_bot"
    query = "summarise the HubSpot activity logging guideline document"

    print(f"\n🔍 Testing agent: {agent_key} (org: {org_id})\nQuery: {query}\n")

    try:
        chain = build_agent_chain(agent_key=agent_key, org_id=org_id)
        print(f"✅ Agent chain built (type: {type(chain)})")

        result = await chain.ainvoke({"input": query}, config=RunnableConfig())
        print("\n🎯 Final Result:\n", result)
    except Exception as e:
        print("❌ ERROR:", e)


if __name__ == "__main__":
    asyncio.run(test_direct_agent())
