from pydantic import BaseModel, UUID4
from datetime import datetime, date
from typing import List, Optional

# ----------------------
# Document File
# ----------------------
class DocumentFileBase(BaseModel):
    original_filename: str
    file_path: str
    uploaded_at: datetime
    version: int

class DocumentFileRead(DocumentFileBase):
    id: UUID4

# ----------------------
# Document Object
# ----------------------
class DocumentObjectBase(BaseModel):
    name: str
    org_id: int  
    review_date: Optional[date]

class DocumentObjectCreate(DocumentObjectBase):
    pass

class DocumentObjectRead(DocumentObjectBase):
    id: UUID4
    current_file_id: Optional[UUID4]
    created_at: datetime
    updated_at: datetime
    versions: List[DocumentFileRead] = []

# ----------------------
# Agent-Document Link
# ----------------------
class AgentDocumentLink(BaseModel):
    agent_id: str
    document_id: UUID4
