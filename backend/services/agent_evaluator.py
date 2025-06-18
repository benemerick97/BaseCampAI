# services/agent_evaluator.py

from langchain_openai import OpenAIEmbeddings
from services.context_retriever import get_vector_retriever
from utils.math import cosine_similarity
from agents.agent_store import agent_store

embeddings = OpenAIEmbeddings()

async def evaluate_agent(agent_key, user_input, org_id, chain):
    try:
        agent_cfg = agent_store.get_agent_config(org_id, agent_key)
        agent_type = agent_cfg.get("type", "retrieval")

        if agent_type == "prompt":
            try:
                # 🔍 Run self-eval mode
                result = await chain.ainvoke({"input": user_input, "mode": "self_eval"})
                text = result.strip() if isinstance(result, str) else getattr(result, "content", "").strip()

                import re
                match = re.search(r"\b([1-9][0-9]?|99)\b", text)
                score = float(match.group(1)) / 100 if match else 0.0

                # 🧠 Run actual response for context
                response = await chain.ainvoke({"input": user_input})
                context = response.strip() if isinstance(response, str) else getattr(response, "content", "").strip()

                print(f"[Eval] Prompt-only Agent: {agent_key} | Self-rated Score: {score:.2f}")

                return {
                    "agent_key": agent_key,
                    "agent_type": "prompt",
                    "chain": chain,
                    "score": score,
                    "context": context
                }

            except Exception as e:
                print(f"[Eval Error] Prompt-agent {agent_key}: {e}")
                return {
                    "agent_key": agent_key,
                    "agent_type": "prompt",
                    "chain": chain,
                    "score": 0.0,
                    "context": "[Agent failed to respond]"
                }

        else:
            retriever = get_vector_retriever(
                org_id=org_id,
                extra_filter={"agent_id": agent_key},
                top_k=3,
            )

            docs = await retriever.ainvoke(user_input)
            valid_docs = [doc for doc in docs if doc.page_content.strip()]
            if not valid_docs:
                return {
                    "agent_key": agent_key,
                    "agent_type": "retrieval",
                    "chain": chain,
                    "score": 0.0,
                    "context": "[No relevant documents found]"
                }

            query_embedding = embeddings.embed_query(user_input)
            scores = []
            for doc in valid_docs:
                try:
                    doc_embedding = embeddings.embed_query(doc.page_content)
                    similarity = cosine_similarity(query_embedding, doc_embedding)
                    scores.append(similarity)
                except Exception as e:
                    print(f"[Eval Warning] Skipped doc for {agent_key} due to embedding error: {e}")
                    continue

            avg_score = sum(scores) / len(scores) if scores else 0.0
            print(f"[Eval] Agent: {agent_key} | Docs: {len(valid_docs)} | Score: {avg_score:.3f}")

            # ✂️ Join top docs for summarisation
            joined_context = "\n\n".join(
                f"[{doc.metadata.get('source') or doc.metadata.get('file_name', 'Unnamed')}]\n{doc.page_content.strip()}"
                for doc in valid_docs
            )

            return {
                "agent_key": agent_key,
                "agent_type": "retrieval",
                "chain": chain,
                "score": avg_score,
                "context": joined_context
            }

    except Exception as e:
        print(f"[Eval Error] Agent {agent_key}: {e}")
        return {
            "agent_key": agent_key,
            "agent_type": "unknown",
            "chain": chain,
            "score": 0.0,
            "context": "[Evaluation failed]"
        }
