# services/summariser.py
from langchain_openai import ChatOpenAI

async def summarise_across_agents(user_input, relevant_agents, stream_handler=None):
    summary_context = "\n\n".join(
        f"Agent: {r['agent_key']}\n{r['context']}" for r in relevant_agents
    )

    summary_prompt = f"""The following is input from multiple agents regarding the user query:

Query: {user_input}

Context:
{summary_context}

Please provide a unified, helpful answer drawing on the relevant content."""

    llm = ChatOpenAI(model="gpt-4", temperature=0, streaming=True, callbacks=[stream_handler] if stream_handler else None)

    async for chunk in llm.astream(summary_prompt):
        yield getattr(chunk, "content", None) or str(chunk)
