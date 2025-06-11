# services/loaders.py

import os
from langchain_community.document_loaders import (
    PyMuPDFLoader as PDFLoader,
    TextLoader,
    UnstructuredWordDocumentLoader,
)

def get_loader(file_path: str, ext: str, metadata: dict = None):
    """
    Load documents from a file based on its extension and optionally inject metadata.

    Args:
        file_path (str): Path to the file to load.
        ext (str): File extension (e.g., 'pdf', 'docx').
        metadata (dict, optional): Extra metadata to inject into each document's metadata.

    Returns:
        list: List of loaded documents with metadata.
    """
    ext = ext.lower()
    file_path = os.path.normpath(file_path)

    if ext == "pdf":
        loader = PDFLoader(file_path)
    elif ext in ["txt", "text"]:
        loader = TextLoader(file_path)
    elif ext in ["doc", "docx"]:
        loader = UnstructuredWordDocumentLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    docs = loader.load()

    # Inject metadata into each document
    for doc in docs:
        doc.metadata["source"] = os.path.basename(file_path)
        if metadata:
            doc.metadata.update(metadata)

    return docs
