from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import os
import asyncio
import json

from services.pdf_service import get_total_pages, get_page_text
from services.llm_service import translate_page_with_sliding_window
from services.storage_service import save_page_markdown, load_page_markdown, get_saved_pages
from services.progress_manager import init_batch_progress, update_batch_progress, stop_batch_progress, get_batch_progress

app = FastAPI(title="Kutob Translator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PageRequest(BaseModel):
    book_name: str
    page_number: int

class SaveRequest(BaseModel):
    book_name: str
    page_number: int
    markdown_content: str

class BatchRequest(BaseModel):
    book_name: str
    start_page: int
    end_page: int

@app.get("/api/book/{book_name}/metadata")
async def get_metadata(book_name: str):
    try:
        total = get_total_pages(book_name)
        saved = get_saved_pages(book_name)
        return {"total_pages": total, "saved_pages": saved}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")

@app.post("/api/translate/page")
async def translate_single_page(req: PageRequest):
    text = await translate_page_with_sliding_window(req.book_name, req.page_number)
    return {"markdown": text}

@app.post("/api/save/page")
async def save_page(req: SaveRequest):
    await save_page_markdown(req.book_name, req.page_number, req.markdown_content)
    return {"status": "saved"}

@app.post("/api/page/content")
async def get_page_content(req: PageRequest):
    # Try getting markdown first, otherwise return nothing (client will have to generate it)
    md = await load_page_markdown(req.book_name, req.page_number)
    return {"markdown": md}

async def batch_translate_task(book_name: str, start: int, end: int):
    init_batch_progress(book_name, end - start + 1)
    
    pages_processed = 0
    for page_num in range(start, end + 1):
        # Skip if already translated? Let's just translate it for now.
        md = await translate_page_with_sliding_window(book_name, page_num)
        if md and not md.startswith("Translation Failed"):
            await save_page_markdown(book_name, page_num, md)
        
        pages_processed += 1
        update_batch_progress(book_name, pages_processed)
    
    stop_batch_progress(book_name)

@app.post("/api/translate/batch")
async def trigger_batch(req: BatchRequest, background_tasks: BackgroundTasks):
    total = get_total_pages(req.book_name)
    if req.end_page > total:
        req.end_page = total
    
    background_tasks.add_task(batch_translate_task, req.book_name, req.start_page, req.end_page)
    return {"status": "started"}

@app.get("/api/stream/progress/{book_name}")
async def message_stream(book_name: str):
    async def event_generator():
        while True:
            progress = get_batch_progress(book_name)
            if not progress:
                yield json.dumps({"status": "idle"})
                await asyncio.sleep(2)
                continue
                
            yield json.dumps(progress)
            
            if progress["status"] == "completed":
                break
                
            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
