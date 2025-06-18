import uuid
from datetime import datetime
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec

# 🔌 Connect to your separate Pinecone log DB
pc = Pinecone(api_key="pcsk_3kGL8J_JRCfAskTLwvQ4GmEX2qpAqT8yTnofm4Do99PZPAT65GdrXSuST8Vkgbv633A1SH")
index = pc.Index("prompt-logs")  # Use a separate index for logs

embeddings = OpenAIEmbeddings()

async def log_prompt(org_id, session_id, user_input, agent_results):
    vector = embeddings.embed_query(user_input)
    log_id = f"log-{uuid.uuid4()}"

    metadata = {
        "org_id": org_id,
        "session_id": session_id,
        "user_input": user_input,
        "timestamp": datetime.utcnow().isoformat(),
        "agent_scores": [f"{r['agent_key']}:{round(r['score'], 3)}" for r in agent_results]
    }


    index.upsert([
        {
            "id": log_id,
            "values": vector,
            "metadata": metadata
        }
    ])
