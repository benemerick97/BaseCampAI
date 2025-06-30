# backend/routes/upload.py

import os
import time
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse

from services.loaders import get_loader
from services.vector_store import store_file_chunks
from services.chunk_tracker import set_chunk_count

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    org_id: str = Form(...)
):
    try:
        # 🧾 Save uploaded file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        saved_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, saved_filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        print("📁 File saved to", file_path)

        ext = file.filename.split(".")[-1].lower()

        # 📄 Load and parse file content
        start = time.time()
        docs = get_loader(file_path, ext, metadata={"agent_id": agent_id, "org_id": org_id})
        elapsed = round(time.time() - start, 2)
        print(f"📄 Parsed {len(docs)} doc(s) in {elapsed}s")

        if not docs:
            print("⚠️ No content found in document")
            return JSONResponse(content={"message": "⚠️ No text found to index."})

        # 🧠 Store in vector DB
        print(f"🧠 Indexing with metadata: agent_id={agent_id}, org_id={org_id}")
        num_chunks = store_file_chunks(
            docs,
            file_id=saved_filename,
            metadata={
                "agent_id": agent_id,
                "org_id": org_id,
                "file_name": file.filename
            }
        )
        set_chunk_count(saved_filename, num_chunks)

        # 🧾 Write metadata file required by /files
        meta_data = {
            "filename": saved_filename,
            "original_name": file.filename,
            "agent_id": agent_id,
            "org_id": org_id
        }
        meta_path = os.path.join(UPLOAD_DIR, f"{saved_filename}.meta.json")
        with open(meta_path, "w") as meta_file:
            json.dump(meta_data, meta_file)

        return JSONResponse(content={
            "message": "✅ Upload and indexing successful",
            "filename": saved_filename,
            "chunks_indexed": num_chunks
        })

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print("❌ Upload failed:", str(e))
        return JSONResponse(content={"message": f"❌ Upload failed: {str(e)}"})
