import os
import json
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse, FileResponse

from services.vector_store import delete_vectors_by_source
from services.chunk_tracker import get_chunk_count, delete_chunk_count, load_chunk_tracker

UPLOAD_DIR = "uploads"

router = APIRouter()

# ---------------------------
# List Uploaded Files
# ---------------------------
@router.get("/files")
async def list_uploaded_files(x_org_id: str = Header(...)):
    try:
        files = [f for f in os.listdir(UPLOAD_DIR) if f.endswith(".meta.json")]
        chunk_data = load_chunk_tracker()
        file_info = []

        for meta_filename in files:
            meta_path = os.path.join(UPLOAD_DIR, meta_filename)
            with open(meta_path, "r") as f:
                metadata = json.load(f)
            if str(metadata.get("org_id")) == x_org_id:
                file_info.append({
                    "filename": metadata["filename"],
                    "original_name": metadata.get("original_name"),
                    "agent_id": metadata.get("agent_id"),
                    "chunks_indexed": chunk_data.get(metadata["filename"], 0)
                })

        return {"files": file_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Delete File
# ---------------------------
@router.delete("/files/{filename}")
async def delete_uploaded_file(filename: str, x_org_id: str = Header(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    meta_path = f"{file_path}.meta.json"

    if not os.path.exists(file_path) or not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail="File or metadata not found")

    with open(meta_path, "r") as f:
        metadata = json.load(f)
    if str(metadata.get("org_id")) != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    os.remove(file_path)
    os.remove(meta_path)

    num_chunks = get_chunk_count(filename)
    if num_chunks > 0:
        delete_vectors_by_source(filename, num_chunks)
    delete_chunk_count(filename)

    return JSONResponse(content={
        "message": f"✅ '{filename}' and {num_chunks} associated vectors deleted",
        "original_name": metadata.get("original_name"),
        "agent_id": metadata.get("agent_id")
    })


# ---------------------------
# Raw File with Header Check (PDF or other)
# ---------------------------
@router.get("/files/raw/{filename}")
async def get_raw_file(filename: str, x_org_id: str = Header(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    meta_path = f"{file_path}.meta.json"

    if not os.path.exists(file_path) or not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail="File or metadata not found")

    with open(meta_path, "r") as f:
        metadata = json.load(f)

    if str(metadata.get("org_id")) != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised to access this file")

    # Set appropriate content type
    ext = filename.split(".")[-1].lower()
    media_type = "application/pdf" if ext == "pdf" else "application/octet-stream"

    return FileResponse(file_path, media_type=media_type, filename=filename)


# ---------------------------
# Text Preview (for txt/md/code files)
# ---------------------------
@router.get("/files/preview/{filename}")
async def preview_text_file(filename: str, x_org_id: str = Header(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    meta_path = f"{file_path}.meta.json"

    if not os.path.exists(file_path) or not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail="File or metadata not found")

    with open(meta_path, "r") as f:
        metadata = json.load(f)

    if str(metadata.get("org_id")) != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised to preview this file")

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read(2000)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read file preview")
