# services/pinecone_v3_retriever.py

import os
from typing import List, Dict, Any
from dotenv import load_dotenv

from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from pydantic import Field

load_dotenv()


class PineconeV3Retriever:
    def __init__(self, index_name: str, namespace: str = "", top_k: int = 5, filter: dict = None):
        self.pinecone = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pinecone.Index(index_name)
        self.embeddings = OpenAIEmbeddings()
        self.namespace = namespace
        self.top_k = top_k
        self.filter = filter or {}

    def _embed_query(self, query: str) -> List[float]:
        return self.embeddings.embed_query(query)

    def _query_index(self, embedded_query: List[float]) -> List[Document]:
        try:
            results = self.index.query(
                vector=embedded_query,
                top_k=self.top_k,
                filter=self.filter,
                namespace=self.namespace,
                include_metadata=True
            )
            matches = results.matches if hasattr(results, "matches") else results.get("matches", [])

            return [
                Document(
                    page_content=match.metadata.get("text", ""),
                    metadata=match.metadata
                )
                for match in matches
                if match and hasattr(match, "metadata")
            ]
        except Exception as e:
            print(f"[Pinecone query error] {e}")
            return []

    def get_relevant_documents(self, query: str) -> List[Document]:
        embedded = self._embed_query(query)
        return self._query_index(embedded)

    async def aget_relevant_documents(self, query: str) -> List[Document]:
        embedded = self._embed_query(query)
        return self._query_index(embedded)

    def as_retriever(self):
        class LangChainPineconeRetriever(BaseRetriever):
            search_kwargs: Dict[str, Any] = Field(default_factory=lambda: {"k": 5})

            def __init__(self, retriever: PineconeV3Retriever):
                super().__init__()
                self._retriever = retriever
                self.search_kwargs = {"k": retriever.top_k}

            def get_relevant_documents(self, query: str) -> List[Document]:
                return self._retriever.get_relevant_documents(query)

            async def aget_relevant_documents(self, query: str) -> List[Document]:
                return await self._retriever.aget_relevant_documents(query)

        return LangChainPineconeRetriever(self)
