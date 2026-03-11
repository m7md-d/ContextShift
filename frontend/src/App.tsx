import { useState, useEffect } from 'react';
import './index.css';
import PDFPane from './components/PDFPane';
import MarkdownPane from './components/MarkdownPane';
import Controls from './components/Controls';
import { API_BASE_URL } from './config';

function App() {
  const [bookName] = useState('cs_app'); // Default test book name
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ percent: number, current: number, total: number, etr: number } | null>(null);

  // Load page content whenever page changes
  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/page/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_name: bookName, page_number: currentPage })
        });
        const data = await res.json();
        setMarkdown(data.markdown || '');
      } catch (err) {
        console.error("Failed to load page content", err);
      }
    }
    loadPage();
  }, [bookName, currentPage]);

  const handleTranslateCurrent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/translate/page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_name: bookName, page_number: currentPage })
      });
      const data = await res.json();
      setMarkdown(data.markdown);
    } catch (err) {
      console.error(err);
      alert('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrent = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/save/page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_name: bookName, page_number: currentPage, markdown_content: markdown })
      });
      alert('Page saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchTranslate = async (startPage: number, endPage: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/translate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_name: bookName, start_page: startPage, end_page: endPage })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // SSE Listener for Batch Progress
  useEffect(() => {
    const sse = new EventSource(`${API_BASE_URL}/api/stream/progress/${bookName}`);
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.status === 'idle') {
        setBatchProgress(null);
      } else if (data.status === 'running' || data.status === 'completed') {
        setBatchProgress({
          percent: data.percent,
          current: data.current_page,
          total: data.total_pages,
          etr: data.etr_seconds
        });
        if (data.status === 'completed') {
          setTimeout(() => setBatchProgress(null), 5000); // clear after 5s
        }
      }
    };
    return () => sse.close();
  }, [bookName]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>كُتُب - Technical Translator</h1>
        <Controls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onTranslate={handleTranslateCurrent}
          onSave={handleSaveCurrent}
          onBatchTranslate={handleBatchTranslate}
          isLoading={isLoading}
          batchProgress={batchProgress}
        />
      </header>
      <main className="workspace">
        <section className="pane">
          <PDFPane
            bookName={bookName}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onDocumentLoad={(total) => setTotalPages(total)}
          />
        </section>
        <section className="pane">
          <MarkdownPane
            markdown={markdown}
            onChange={setMarkdown}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
