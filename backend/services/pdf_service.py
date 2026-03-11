import fitz  # PyMuPDF
import os

PDF_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(PDF_DIR, exist_ok=True)

def get_pdf_path(book_name: str) -> str:
    # Assuming there's a `.pdf` file with the book_name in the uploads dir.
    # In a real app we might store the path in a DB, but for this localized app,
    # let's assume `uploads/{book_name}.pdf` exists.
    return os.path.join(PDF_DIR, f"{book_name}.pdf")

def get_total_pages(book_name: str) -> int:
    """Returns the total number of pages in the PDF."""
    path = get_pdf_path(book_name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"PDF for {book_name} not found.")
        
    doc = fitz.open(path)
    total = len(doc)
    doc.close()
    return total

def get_page_text(book_name: str, page_number: int) -> str:
    """Gets the text for a specific 1-indexed page number. Returns empty string if out of bounds."""
    path = get_pdf_path(book_name)
    if not os.path.exists(path):
        return ""
        
    try:
        doc = fitz.open(path)
        if page_number < 1 or page_number > len(doc):
            doc.close()
            return ""
            
        # PyMuPDF is 0-indexed
        page = doc.load_page(page_number - 1)
        text = page.get_text("text")
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error reading page {page_number} of {book_name}: {e}")
        return ""
