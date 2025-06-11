# backend/agents/build_agent.py

import os
import asyncio
from typing import Optional
from dotenv import load_dotenv

from langchain_core.runnables import Runnable
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_core.callbacks.base import BaseCallbackHandler

from services.context_retriever import get_vector_retriever
from services.prompt_builder import get_org_context_prompt
from agents.agent_store import agent_store

load_dotenv()

def get_base_prompt(agent_key: str, agent_cfg: dict, org_id: str) -> str:
    if agent_key == "org_context_bot":
        return get_org_context_prompt(org_id)
    return agent_cfg.get("prompt", "You are a helpful assistant.")

# ✅ Simple memory-based chain if you ever want full history (not used in router)
class MemoryChain(Runnable):
    def __init__(self, llm, base_prompt: str, history: list[dict]):
        self.llm = llm
        self.base_prompt = base_prompt
        self.history = history

    def invoke(self, inputs: dict):
        return asyncio.run(self.ainvoke(inputs))

    async def ainvoke(self, inputs: dict):
        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)]

        for h in self.history:
            if h["role"] == "user":
                messages.append(HumanMessage(content=h["content"]))
            elif h["role"] == "assistant":
                messages.append(AIMessage(content=h["content"]))

        messages.append(HumanMessage(content=query))
        response = await self.llm.ainvoke(messages)
        return response.content

    async def astream(self, inputs: dict):
        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)]

        for h in self.history:
            if h["role"] == "user":
                messages.append(HumanMessage(content=h["content"]))
            elif h["role"] == "assistant":
                messages.append(AIMessage(content=h["content"]))

        messages.append(HumanMessage(content=query))
        async for chunk in self.llm.astream(messages):
            yield chunk.content if hasattr(chunk, "content") else str(chunk)

# ✅ AgentChain supports retrieval + last N history messages
class AgentChain(Runnable):
    def __init__(self, llm, prompt: str, retriever, history: Optional[list[dict]] = None, max_history: int = 5):
        self.llm = llm
        self.prompt = prompt
        self.retriever = retriever
        self.history = history or []
        self.max_history = max_history

    def invoke(self, inputs: dict):
        return asyncio.run(self.ainvoke(inputs))

    async def ainvoke(self, inputs: dict):
        query = inputs.get("input", "")
        docs = await self.retriever.ainvoke(query)

        print(f"\n[DEBUG] Retrieved {len(docs)} documents for query: {query}")

        if not docs or not any(doc.page_content.strip() for doc in docs):
            print("[DEBUG] No relevant documents with content.")
            return "No relevant documents found."

        for i, doc in enumerate(docs[:3]):
            content = doc.page_content.strip() if doc.page_content else "<EMPTY>"
            print(f"[DEBUG] Doc {i+1} content preview:\n{content[:300]}\n")

        doc_text = "\n\n".join(
            f"[{doc.metadata.get('source') or doc.metadata.get('file_name', 'Unnamed Document')}]\n{doc.page_content.strip()}"
            for doc in docs if doc.page_content and doc.page_content.strip()
        )

        full_prompt = f"""{self.prompt.strip()}

Use the following internal documents to answer the user's question.
Only answer based on the content. Do not say you don’t have the document—it’s provided below.

Documents:
{doc_text}
"""

        print(f"[DEBUG] Final prompt preview:\n{full_prompt[:1000]}\n")

        messages = [SystemMessage(content=full_prompt)]

        # Inject last N chat history messages
        for h in self.history[-self.max_history:]:
            if h["role"] == "user":
                messages.append(HumanMessage(content=h["content"]))
            elif h["role"] == "assistant":
                messages.append(AIMessage(content=h["content"]))

        messages.append(HumanMessage(content=query))
        response = await self.llm.ainvoke(messages)
        return response.content

    async def astream(self, inputs: dict):
        query = inputs.get("input", "")
        docs = await self.retriever.ainvoke(query)

        if not docs or not any(doc.page_content.strip() for doc in docs):
            yield "No relevant documents found."
            return

        doc_text = "\n\n".join(
            f"[{doc.metadata.get('source') or doc.metadata.get('file_name', 'Unnamed Document')}]\n{doc.page_content.strip()}"
            for doc in docs if doc.page_content and doc.page_content.strip()
        )

        full_prompt = f"""{self.prompt.strip()}

Use the following internal documents to answer the user's question.
Only answer based on the content. Do not say you don’t have the document—it’s provided below.

Documents:
{doc_text}
"""

        messages = [SystemMessage(content=full_prompt)]

        for h in self.history[-self.max_history:]:
            if h["role"] == "user":
                messages.append(HumanMessage(content=h["content"]))
            elif h["role"] == "assistant":
                messages.append(AIMessage(content=h["content"]))

        messages.append(HumanMessage(content=query))
        async for chunk in self.llm.astream(messages):
            yield chunk.content if hasattr(chunk, "content") else str(chunk)

# ✅ Chain builder for both retrieval and memory-based agents
def build_agent_chain(
    agent_key: str,
    org_id: str,
    stream_handler: Optional[BaseCallbackHandler] = None,
    model_name: str = "gpt-4-0613",
    history: Optional[list[dict]] = None,
    use_memory: bool = False,
    max_history: int = 5
) -> Runnable:
    agent_cfg = agent_store.get_agent_config(org_id, agent_key)
    if not agent_cfg:
        raise ValueError(f"No agent config found for key '{agent_key}' in org '{org_id}'.")

    base_prompt = get_base_prompt(agent_key, agent_cfg, org_id)

    llm = ChatOpenAI(
        model=model_name,
        temperature=0,
        streaming=True,
        callbacks=[stream_handler] if stream_handler else None
    )

    if use_memory and history:
        return MemoryChain(llm=llm, base_prompt=base_prompt, history=history)

    retriever = get_vector_retriever(
        org_id=org_id,
        extra_filter={"agent_id": agent_key},
        top_k=5
    )

    return AgentChain(
        llm=llm,
        prompt=base_prompt,
        retriever=retriever,
        history=history,
        max_history=max_history
    )
