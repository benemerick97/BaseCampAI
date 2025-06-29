import shutil
from fastapi import UploadFile

async def save_uploaded_file_to_disk(file: UploadFile, dest_path: str):
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
