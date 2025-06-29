import os
import uuid
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, Header, Path
from sqlalchemy.orm import Session
from typing import List

from databases.database import get_db
from schemas.document import DocumentObjectCreate, DocumentObjectRead
from CRUD.document import (
    create_document_object,
    add_document_file_version,
    update_current_file_reference,
    list_document_objects_by_org,
    get_document_object,
    get_latest_file_version,
    delete_document_object,
)
from services.vector_store import store_file_chunks, delete_vectors_by_source
from utils.file_utils import save_uploaded_file_to_disk
from langchain.document_loaders import PyPDFLoader

router = APIRouter()


# ---------------------------
# Create New Document Object
# ---------------------------
@router.post("/document-objects", response_model=DocumentObjectRead)
async def create_document_with_upload(
    org_id: str = Header(...),
    name: str = Form(...),
    review_date: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        # Step 1: Create document record
        doc_obj = create_document_object(
            db, DocumentObjectCreate(name=name, org_id=org_id, review_date=review_date)
        )

        # Step 2: Save file to disk
        upload_dir = os.path.join("uploads", str(doc_obj.id))
        os.makedirs(upload_dir, exist_ok=True)

        original_filename = file.filename
        version = 1
        file_path = os.path.join(upload_dir, f"v{version}_{original_filename}")
        await save_uploaded_file_to_disk(file, file_path)

        # Step 3: Embed to Pinecone
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        store_file_chunks(docs, file_id=str(doc_obj.id), metadata={"org_id": org_id})

        # Step 4: Save version
        file_record = add_document_file_version(
            db,
            document_id=doc_obj.id,
            file_path=file_path,
            original_filename=original_filename,
            version=version
        )
        update_current_file_reference(db, doc_obj, file_record.id)

        return doc_obj

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ---------------------------
# List Document Objects
# ---------------------------
@router.get("/document-objects", response_model=List[DocumentObjectRead])
def list_documents(x_org_id: str = Header(...), db: Session = Depends(get_db)):
    return list_document_objects_by_org(db, x_org_id)


# ---------------------------
# Replace a file with new version
# ---------------------------
@router.put("/document-objects/{document_id}/file", response_model=DocumentObjectRead)
async def replace_document_file(
    document_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_org_id: str = Header(...)
):
    doc = get_document_object(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.org_id != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    try:
        # Step 1: Version bump
        version = get_latest_file_version(db, document_id) + 1
        upload_dir = os.path.join("uploads", str(document_id))
        os.makedirs(upload_dir, exist_ok=True)

        original_filename = file.filename
        new_file_path = os.path.join(upload_dir, f"v{version}_{original_filename}")
        await save_uploaded_file_to_disk(file, new_file_path)

        # Step 2: Delete old vectors
        delete_vectors_by_source(str(document_id))

        # Step 3: Re-embed
        loader = PyPDFLoader(new_file_path)
        docs = loader.load()
        store_file_chunks(docs, file_id=str(document_id), metadata={"org_id": x_org_id})

        # Step 4: Save new file version
        file_record = add_document_file_version(
            db,
            document_id=document_id,
            file_path=new_file_path,
            original_filename=original_filename,
            version=version
        )
        update_current_file_reference(db, doc, file_record.id)

        return doc

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File update failed: {str(e)}")


# ---------------------------
# Get Document Object
# ---------------------------
@router.get("/document-objects/{document_id}", response_model=DocumentObjectRead)
def get_document_details(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    x_org_id: str = Header(...)
):
    doc = get_document_object(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.org_id != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    return doc


# ---------------------------
# Delete Document Object
# ---------------------------
@router.delete("/document-objects/{document_id}")
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    x_org_id: str = Header(...)
):
    # Step 1: Validate ownership
    doc = get_document_object(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.org_id != x_org_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    # Step 2: Delete all uploaded files
    upload_dir = os.path.join("uploads", str(document_id))
    if os.path.exists(upload_dir):
        for f in os.listdir(upload_dir):
            try:
                os.remove(os.path.join(upload_dir, f))
            except Exception as e:
                print(f"⚠️ Could not delete file: {f} - {e}")
        try:
            os.rmdir(upload_dir)
        except Exception as e:
            print(f"⚠️ Could not remove upload folder: {e}")

    # Step 3: Delete vectors
    try:
        delete_vectors_by_source(str(document_id))
    except Exception as e:
        print(f"⚠️ Vector deletion failed: {e}")

    # Step 4: Remove from database
    try:
        delete_document_object(db, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB deletion failed: {e}")

    return {"message": f"✅ Document {document_id} deleted successfully"}
