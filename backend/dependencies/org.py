from fastapi import Header, HTTPException
from uuid import UUID

def get_org_id(x_org_id: int = Header(...)) -> UUID:
    if not x_org_id:
        raise HTTPException(status_code=400, detail="Missing x-org-id header")
    return x_org_id
