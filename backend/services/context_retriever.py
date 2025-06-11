# services/context_retriever.py

import os
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings
from services.pinecone_v3_retriever import PineconeV3Retriever

load_dotenv()

# Initialise the embedding model once
embedding_model = OpenAIEmbeddings()

def get_vector_retriever(
    org_id: str,
    extra_filter: dict = None,
    top_k: int = 5,
    namespace: str = ""
):
    index_name = os.getenv("PINECONE_INDEX")
    if not index_name:
        raise ValueError("PINECONE_INDEX is not set in environment variables.")

    # Merge org filter with any additional metadata filters
    filter_metadata = {"org_id": org_id}
    if extra_filter:
        filter_metadata.update(extra_filter)

    # 🔍 Optional debug log
    print(f"[ContextRetriever] filter: {filter_metadata}, top_k={top_k}, ns={namespace}")

    retriever = PineconeV3Retriever(
        index_name=index_name,
        namespace=namespace,
        top_k=top_k,
        filter=filter_metadata
    )

    return retriever.as_retriever()
