import React from 'react';
import { RefreshCw, Save, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    onTranslate: () => void;
    onSave: () => void;
    onBatchTranslate: (start: number, end: number) => void;
    isLoading: boolean;
    batchProgress: { percent: number; current: number; total: number; etr: number } | null;
}

const Controls: React.FC<Props> = ({
    currentPage,
    totalPages,
    onPageChange,
    onTranslate,
    onSave,
    onBatchTranslate,
    isLoading,
    batchProgress
}) => {

    const handleBatch = () => {
        // For demo purposes, translating next 5 pages
        const endPage = Math.min(currentPage + 4, totalPages);
        if (window.confirm(`Batch translate from Page ${currentPage} to ${endPage}?`)) {
            onBatchTranslate(currentPage, endPage);
        }
    };

    const formatEtr = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="controls-bar">

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
                <button
                    className="btn"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Page {currentPage} / {totalPages}
                </span>
                <button
                    className="btn"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {batchProgress ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-color)', padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Batch Translating:</span> {batchProgress.current}/{batchProgress.total}
                        <strong style={{ margin: '0 8px' }}>({batchProgress.percent}%)</strong>
                    </div>
                    <div style={{ width: '100px', height: '6px', background: 'var(--bg-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${batchProgress.percent}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ETR: {formatEtr(batchProgress.etr)}
                    </div>
                </div>
            ) : (
                <>
                    <button className="btn" onClick={onTranslate} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? "spinner" : ""} />
                        Translate Current
                    </button>
                    <button className="btn success" onClick={onSave} disabled={isLoading}>
                        <Save size={16} />
                        Approve & Save
                    </button>
                    <button className="btn primary" onClick={handleBatch} disabled={isLoading}>
                        <Layers size={16} />
                        Batch Translate
                    </button>
                </>
            )}
        </div>
    );
};

export default Controls;
