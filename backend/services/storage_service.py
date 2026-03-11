import os
import aiofiles

def get_book_dir(book_name: str) -> str:
    """Returns the directory path for the given book, creating it if necessary."""
    base_dir = os.path.join(os.getcwd(), "books", book_name)
    os.makedirs(base_dir, exist_ok=True)
    return base_dir

async def save_page_markdown(book_name: str, page_number: int, markdown_content: str):
    """Saves the translated markdown content to `books/BookName/{page_number}.md`."""
    book_dir = get_book_dir(book_name)
    file_path = os.path.join(book_dir, f"{page_number}.md")
    
    async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
        await f.write(markdown_content)

async def load_page_markdown(book_name: str, page_number: int) -> str:
    """Loads the translated markdown content from `books/BookName/{page_number}.md` if it exists."""
    book_dir = get_book_dir(book_name)
    file_path = os.path.join(book_dir, f"{page_number}.md")
    
    if not os.path.exists(file_path):
        return ""
        
    async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
        return await f.read()

def get_saved_pages(book_name: str) -> list[int]:
    """Returns a list of saved page numbers for a book."""
    book_dir = get_book_dir(book_name)
    saved_pages = []
    if not os.path.exists(book_dir):
        return []
    
    for filename in os.listdir(book_dir):
        if filename.endswith(".md"):
            try:
                page_num = int(filename.split(".")[0])
                saved_pages.append(page_num)
            except ValueError:
                pass
                
    return sorted(saved_pages)
