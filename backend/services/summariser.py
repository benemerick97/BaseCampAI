from langchain_openai import ChatOpenAI

async def summarise_across_agents(user_input, relevant_agents, stream_handler=None):
    # 🔍 Build formatted agent summaries with fallback context
    summary_context = "\n\n".join(
        f"""Agent: {r['agent_key']}
Type: {r.get('agent_type', 'unknown')}
Relevance Score: {r.get('score', 0.0):.2f}
---
{r.get('context', '[No context provided]')}"""
        for r in sorted(relevant_agents, key=lambda x: x.get("score", 0.0), reverse=True)
    )

    # 🧠 Role + task framing to boost response quality
    summary_prompt = f"""
You are Basecamp, a senior technical assistant responsible for combining input from specialist agents at Real Time Instruments.

The user has asked the following question:

"{user_input}"

Below is relevant background information from internal specialists, sorted by relevance.

Your job is to:
- Synthesise the input into a single, unified technical recommendation
- Avoid referencing where the information came from or which agent provided it
- Emphasise clarity, depth, and actionable insight
- Eliminate contradictions and remove anything irrelevant

Background Content:
{summary_context}

Please respond with a helpful, technically sound answer to the user's question.
"""

    # 🎯 Run the summarisation with streaming support
    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0,
        streaming=True,
        callbacks=[stream_handler] if stream_handler else None
    )

    async for chunk in llm.astream(summary_prompt):
        text = getattr(chunk, "content", None)
        if text:
            yield text
