#backend/services/clarification_handler.py

from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from services.prompt_builder import format_history_as_string
from utils.logger import logger

# 🔍 Simple continuation trigger list
CONTINUATION_TERMS = ["another", "again", "one more", "more", "next"]


def get_llm(temperature: float = 0, model: str = "gpt-4") -> ChatOpenAI:
    return ChatOpenAI(model=model, temperature=temperature)


def is_continuation_request(user_input: str, history: list[dict]) -> bool:
    input_lower = user_input.lower()
    if not any(term in input_lower for term in CONTINUATION_TERMS):
        return False

    # Check if last bot message was suitable for follow-up
    last_bot_msg = next(
        (m["content"].lower() for m in reversed(history) if m["role"] == "assistant"), ""
    )
    return any(trigger in last_bot_msg for trigger in ["joke", "fun fact", "trivia", "fact", "pun"])


def is_input_vague(user_input: str, history: list[dict]) -> bool:
    try:
        prompt = PromptTemplate.from_template("""
Given the conversation so far:

{history}

And the user input:
"{input}"

Classify the input as either 'clear' or 'vague'. Respond with one word.
""").partial(history=format_history_as_string(history[-6:]))

        result = (prompt | get_llm() | StrOutputParser()).invoke({"input": user_input}).strip().lower()
        logger.debug(f"[Clarity Classifier] Input: '{user_input}' → {result}")
        return result == "vague"

    except Exception as e:
        logger.error(f"[Clarity Classifier Error] {e}")
        return False


def get_clarifier_chain(org_id: str):
    from services.prompt_builder import get_registered_agents_summary

    agent_list = get_registered_agents_summary(org_id)
    template = """
You are Basecamp, a helpful assistant for RTI.

If the user's question is too vague, ask a clarifying question.
Do not answer the question yet — just ask for clarification.

RTI uses Basecamp to route questions to specialist agents. These agents include:
{agent_list}

User: {input}
Assistant:"""

    prompt = PromptTemplate.from_template(template).partial(agent_list=agent_list)
    return prompt | get_llm(temperature=0.3) | StrOutputParser()
