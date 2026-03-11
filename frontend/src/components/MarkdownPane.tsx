import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface Props {
    markdown: string;
    onChange: (val: string) => void;
    isLoading: boolean;
}

const MarkdownPane: React.FC<Props> = ({ markdown, onChange, isLoading }) => {
    const [mode, setMode] = useState<'preview' | 'edit'>('preview');

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p className="spinner" style={{ fontSize: '2rem' }}>⚙️</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="tabs">
                <button
                    className={`tab ${mode === 'preview' ? 'active' : ''}`}
                    onClick={() => setMode('preview')}
                >
                    Preview
                </button>
                <button
                    className={`tab ${mode === 'edit' ? 'active' : ''}`}
                    onClick={() => setMode('edit')}
                >
                    Edit Raw Markdown
                </button>
            </div>

            {mode === 'edit' ? (
                <div style={{ padding: '24px', flex: 1 }}>
                    <textarea
                        className="md-editor"
                        value={markdown}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Translation will appear here..."
                    />
                </div>
            ) : (
                <div className="markdown-pane">
                    {markdown ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {markdown}
                        </ReactMarkdown>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                            No translation available for this page yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarkdownPane;
