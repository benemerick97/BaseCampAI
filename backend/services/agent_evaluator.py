# services/agent_evaluator.py

from langchain_openai import OpenAIEmbeddings
from services.context_retriever import get_vector_retriever
from utils.math import cosine_similarity

embeddings = OpenAIEmbeddings()

async def evaluate_agent(agent_key, user_input, org_id, chain):
    try:
        retriever = get_vector_retriever(
            org_id=org_id,
            extra_filter={"agent_id": agent_key},
            top_k=3,
        )

        docs = await retriever.ainvoke(user_input)
        valid_docs = [doc for doc in docs if doc.page_content.strip()]
        if not valid_docs:
            return None

        try:
            query_embedding = embeddings.embed_query(user_input)
        except Exception as e:
            print(f"[Eval Error] Failed to embed query for {agent_key}: {e}")
            return None

        scores = []
        for doc in valid_docs:
            try:
                doc_embedding = embeddings.embed_query(doc.page_content)
                similarity = cosine_similarity(query_embedding, doc_embedding)
                scores.append(similarity)
            except Exception as e:
                print(f"[Eval Warning] Skipped doc for {agent_key} due to embedding error: {e}")
                continue

        if not scores:
            return None

        avg_score = sum(scores) / len(scores)
        if avg_score < 0.7:
            return None

        context = "\n\n".join(doc.page_content.strip() for doc in valid_docs)
        print(f"[Eval] Agent: {agent_key} | Docs: {len(valid_docs)} | Score: {avg_score:.3f}")

        return {
            "agent_key": agent_key,
            "chain": chain,
            "score": avg_score,
            "context": context
        }

    except Exception as e:
        print(f"[Eval Error] Agent {agent_key}: {e}")
        return None
