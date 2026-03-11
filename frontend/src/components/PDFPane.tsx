import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { API_BASE_URL } from '../config';

interface Props {
    bookName: string;
    currentPage: number;
    onPageChange: (page: number) => void;
    onDocumentLoad: (totalPages: number) => void;
}

const PDFPane: React.FC<Props> = ({ bookName, currentPage, onPageChange, onDocumentLoad }) => {
    // We assume the PDF is accessible at a public URL on the backend, or we load it from a specific path.
    // For the sake of this local architecture: we can fetch it or just point the Viewer to a static URL if the FastAPI app serves static files.
    // Wait, I should add a static route in FastAPI to serve the PDF.
    const fileUrl = `${API_BASE_URL}/uploads/${bookName}.pdf`;

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (_defaultTabs: any) => [],
    });

    const handlePageChange = (e: any) => {
        // e.currentPage is 0-indexed in react-pdf-viewer
        onPageChange(e.currentPage + 1);
    };

    const handleDocumentLoad = (e: any) => {
        onDocumentLoad(e.doc.numPages);
    };

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    initialPage={currentPage - 1}
                    onPageChange={handlePageChange}
                    onDocumentLoad={handleDocumentLoad}
                />
            </Worker>
        </div>
    );
};

export default PDFPane;
