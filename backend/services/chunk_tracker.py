import json
import os

# Store tracker alongside the uploaded files
UPLOAD_DIR = "uploads"
TRACKER_PATH = os.path.join(UPLOAD_DIR, "chunks_tracker.json")

def load_chunk_tracker():
    if not os.path.exists(TRACKER_PATH):
        return {}
    with open(TRACKER_PATH, "r") as f:
        return json.load(f)

def save_chunk_tracker(data):
    with open(TRACKER_PATH, "w") as f:
        json.dump(data, f, indent=2)

def set_chunk_count(filename: str, count: int):
    data = load_chunk_tracker()
    data[filename] = count
    save_chunk_tracker(data)

def get_chunk_count(filename: str) -> int:
    data = load_chunk_tracker()
    return data.get(filename, 0)

def delete_chunk_count(filename: str):
    data = load_chunk_tracker()
    if filename in data:
        del data[filename]
        save_chunk_tracker(data)
