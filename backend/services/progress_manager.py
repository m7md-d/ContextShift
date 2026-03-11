import asyncio
from typing import Dict, Any

# In-memory progress store keyed by book_name
# Format: { "book_name": { "current_page": 1, "total_pages": 100, "status": "running/completed/stopped", "etr_seconds": 0 } }
_progress_store: Dict[str, Dict[str, Any]] = {}

def init_batch_progress(book_name: str, total_pages: int):
    _progress_store[book_name] = {
        "current_page": 0,
        "total_pages": total_pages,
        "status": "running",
        "etr_seconds": 0,
        "start_time": asyncio.get_event_loop().time(),
        "percent": 0
    }

def update_batch_progress(book_name: str, current_page: int):
    if book_name in _progress_store:
        state = _progress_store[book_name]
        state["current_page"] = current_page
        
        # Calculate ETR
        elapsed = asyncio.get_event_loop().time() - state["start_time"]
        if current_page > 0:
            avg_time_per_page = elapsed / current_page
            remaining_pages = state["total_pages"] - current_page
            state["etr_seconds"] = int(avg_time_per_page * remaining_pages)
            state["percent"] = int((current_page / state["total_pages"]) * 100)

def stop_batch_progress(book_name: str):
    if book_name in _progress_store:
        _progress_store[book_name]["status"] = "completed"
        _progress_store[book_name]["etr_seconds"] = 0
        _progress_store[book_name]["percent"] = 100

def get_batch_progress(book_name: str) -> dict:
    return _progress_store.get(book_name, None)
