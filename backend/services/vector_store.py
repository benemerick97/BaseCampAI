import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

load_dotenv()

# Init Pinecone v3 client
api_key = os.getenv("PINECONE_API_KEY")
index_name = os.getenv("PINECONE_INDEX")

pc = Pinecone(api_key=api_key)
index = pc.Index(index_name)
embedding_model = OpenAIEmbeddings()

def store_file_chunks(docs, file_id: str, metadata: dict = None) -> int:
    """
    Splits, embeds, and stores document chunks in Pinecone with optional global metadata.
    Returns the number of chunks stored.
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    print(f"🧠 [vector_store] Parsed {len(docs)} docs, split into {len(chunks)} chunks")

    try:
        texts = [chunk.page_content for chunk in chunks]
        embeddings = embedding_model.embed_documents(texts)

        vectors = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_metadata = {
                **(metadata or {}),       # agent_id, org_id, etc.
                **chunk.metadata,         # any document-level metadata
                "source": file_id,        # consistent filename reference
                "text": chunk.page_content
            }

            vectors.append({
                "id": f"{file_id}_{i}",
                "values": embedding,
                "metadata": chunk_metadata
            })

        index.upsert(vectors=vectors)
        print(f"✅ [vector_store] Stored {len(vectors)} vectors to index '{index_name}'")
        return len(vectors)

    except Exception as e:
        print("❌ [vector_store] Failed to store in Pinecone:", str(e))
        return 0


def delete_vectors_by_source(source_filename: str, num_chunks: int) -> int:
    """
    Deletes all vectors for a given source file, assuming a known chunk count.
    """
    try:
        ids_to_delete = [f"{source_filename}_{i}" for i in range(num_chunks)]
        index.delete(ids=ids_to_delete)
        print(f"🧹 Deleted {len(ids_to_delete)} vectors for '{source_filename}'")
        return len(ids_to_delete)

    except Exception as e:
        print(f"❌ Failed to delete vectors for '{source_filename}': {e}")
        return 0
