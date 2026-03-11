from openai import AsyncOpenAI
import os
from services.pdf_service import get_page_text

LM_STUDIO_URL = os.environ.get("LM_STUDIO_URL", "http://localhost:1234/v1")
# LM Studio default local server or docker host machine
client = AsyncOpenAI(base_url=LM_STUDIO_URL, api_key="lm-studio")

SYSTEM_PROMPT = """You are an Expert Full-Stack Technical Translator. Your overarching goal is to translate a highly technical computer science book from English into Arabic.
You will receive the text from 3 pages: [Previous Page N-1], [Target Page N], and [Next Page N+1].
You MUST ONLY translate the [Target Page N] into Arabic Markdown. The Previous and Next pages are strictly provided for context to maintain flow, sentence continuation, and terminology consistency.

Formatting Rules:
1. Translate into high-level, professional technical Arabic.
2. Keep critical English technical terms, Algorithms, and variable names in English, perhaps providing the Arabic translation in parentheses initially.
3. The output MUST BE valid Markdown.
4. Keep Code Blocks in English without translating the code syntax. Example: ```c ... ```
5. Do NOT include any explanations or conversational chatter. Just return the translated Markdown for [Target Page N].
"""

async def translate_page_with_sliding_window(book_name: str, target_page: int) -> str:
    """Forms the sliding window context and calls the LLM for translation."""
    
    # Get N-1
    prev_text = get_page_text(book_name, target_page - 1) if target_page > 1 else ""
    # Get N
    target_text = get_page_text(book_name, target_page)
    # Get N+1
    next_text = get_page_text(book_name, target_page + 1)
    
    if not target_text:
        return "Error: No text found on target page."
    
    user_content = f"""
[Previous Page Context N-1]
{prev_text}
---
[Target Page N - THIS IS THE ONLY PAGE YOU SHOULD TRANSLATE]
{target_text}
---
[Next Page Context N+1]
{next_text}
"""

    try:
        response = await client.chat.completions.create(
            model="local-model", # Model name is ignored by LM studio typically, but needs a string
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Translation Failed: {str(e)}"
