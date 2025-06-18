import os
import asyncio
from typing import Optional, List
from dotenv import load_dotenv

from langchain_core.runnables import Runnable
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_openai import ChatOpenAI

from services.context_retriever import get_vector_retriever
from services.prompt_builder import get_org_context_prompt
from agents.agent_store import agent_store

load_dotenv()


def get_base_prompt(agent_key: str, agent_cfg: dict, org_id: str) -> str:
    if agent_key == "org_context_bot":
        return get_org_context_prompt(org_id)
    base = agent_cfg.get("prompt", "You are a helpful assistant.").strip()
    name = agent_cfg.get("name", "Assistant").strip()
    return f"{base}\n\nUser: {{input}}\n{name}:"


class MemoryChain(Runnable):
    def __init__(self, llm, base_prompt: str, history: List[dict]):
        self.llm = llm
        self.base_prompt = base_prompt
        self.history = history

    async def ainvoke(self, inputs: dict):
        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history
        ] + [HumanMessage(content=query)]
        return (await self.llm.ainvoke(messages)).content

    async def astream(self, inputs: dict):
        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history
        ] + [HumanMessage(content=query)]
        async for chunk in self.llm.astream(messages):
            yield getattr(chunk, "content", str(chunk))


class PromptOnlyAgentChain(Runnable):
    def __init__(self, llm, base_prompt: str, history: Optional[List[dict]] = None, max_history: int = 5):
        self.llm = llm
        self.base_prompt = base_prompt
        self.history = history or []
        self.max_history = max_history
    
    def invoke(self, inputs: dict):
        raise NotImplementedError("Sync invoke is not supported. Use `ainvoke` instead.")

    async def ainvoke(self, inputs: dict):
        if inputs.get("mode") == "self_eval":
            eval_prompt = f"""{self.base_prompt.strip()}

User question: "{inputs.get("input", "")}"

On a scale from 1 to 99, how confident are you in your ability to answer this question based on your expertise? Respond with a single number only.
"""
            return (await self.llm.ainvoke([HumanMessage(content=eval_prompt)])).content.strip()

        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history[-self.max_history:]
        ] + [HumanMessage(content=query)]
        return (await self.llm.ainvoke(messages)).content

    async def astream(self, inputs: dict):
        query = inputs.get("input", "")
        messages = [SystemMessage(content=self.base_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history[-self.max_history:]
        ] + [HumanMessage(content=query)]
        async for chunk in self.llm.astream(messages):
            yield getattr(chunk, "content", str(chunk))


class AgentChain(Runnable):
    def __init__(self, llm, prompt: str, retriever, history: Optional[List[dict]] = None, max_history: int = 5):
        self.llm = llm
        self.prompt = prompt
        self.retriever = retriever
        self.history = history or []
        self.max_history = max_history

    def invoke(self, inputs: dict):
        raise NotImplementedError("Sync invoke is not supported. Use `ainvoke` instead.")

    async def ainvoke(self, inputs: dict):
        query = inputs.get("input", "")
        docs = await self.retriever.ainvoke(query)
        if not docs or not any(doc.page_content.strip() for doc in docs):
            return "No relevant documents found."

        doc_text = "\n\n".join(
            f"[{doc.metadata.get('source') or doc.metadata.get('file_name', 'Unnamed')}]\n{doc.page_content.strip()}"
            for doc in docs if doc.page_content.strip()
        )

        full_prompt = f"""{self.prompt.strip()}

Use the following internal documents to answer the user's question.
Only answer based on the content. Do not say you don’t have the document—it’s provided below.

Documents:
{doc_text}
"""
        messages = [SystemMessage(content=full_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history[-self.max_history:]
        ] + [HumanMessage(content=query)]

        return (await self.llm.ainvoke(messages)).content

    async def astream(self, inputs: dict):
        query = inputs.get("input", "")
        docs = await self.retriever.ainvoke(query)
        if not docs or not any(doc.page_content.strip() for doc in docs):
            yield "No relevant documents found."
            return

        doc_text = "\n\n".join(
            f"[{doc.metadata.get('source') or doc.metadata.get('file_name', 'Unnamed')}]\n{doc.page_content.strip()}"
            for doc in docs if doc.page_content.strip()
        )

        full_prompt = f"""{self.prompt.strip()}

Use the following internal documents to answer the user's question.
Only answer based on the content. Do not say you don’t have the document—it’s provided below.

Documents:
{doc_text}
"""
        messages = [SystemMessage(content=full_prompt)] + [
            HumanMessage(content=h["content"]) if h["role"] == "user" else AIMessage(content=h["content"])
            for h in self.history[-self.max_history:]
        ] + [HumanMessage(content=query)]

        async for chunk in self.llm.astream(messages):
            yield getattr(chunk, "content", str(chunk))


def build_agent_chain(
    agent_key: str,
    org_id: str,
    stream_handler: Optional[BaseCallbackHandler] = None,
    model_name: str = "gpt-4-0613",
    history: Optional[List[dict]] = None,
    use_memory: bool = False,
    max_history: int = 5,
    agent_type: Optional[str] = None
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

    agent_type = agent_type or agent_cfg.get("type", "retrieval")

    if use_memory and history:
        return MemoryChain(llm=llm, base_prompt=base_prompt, history=history)

    if agent_type == "prompt":
        return PromptOnlyAgentChain(llm=llm, base_prompt=base_prompt, history=history, max_history=max_history)

    retriever = get_vector_retriever(org_id=org_id, extra_filter={"agent_id": agent_key}, top_k=5)
    return AgentChain(llm=llm, prompt=base_prompt, retriever=retriever, history=history, max_history=max_history)
