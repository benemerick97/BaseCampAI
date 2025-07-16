# services/openai_client.py

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "").strip())

def get_chat_stream(messages: list[dict]):
    return client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        top_p=0.9,
        max_tokens=512,
        stream=True,
    )
