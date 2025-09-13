import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { getToken } from "../utils/auth";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import axios from "axios";
import NoteEditor from "./NoteEditor";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;



const PdfViewer = () => {
    const { uuid } = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [selectionInfo, setSelectionInfo] = useState(null); // { text, rect }
    const [selectionRange, setSelectionRange] = useState(null); // Save DOM Range
    const [highlights, setHighlights] = useState([]);
    const [highlightColor, setHighlightColor] = useState('#ffe066'); // default yellow
    const textLayerRef = useRef(null);
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [currentHighlight, setCurrentHighlight] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingOpenEditor, setPendingOpenEditor] = useState(true);
    // Remove noteText state, will be managed in NoteEditor

    // Keep selection visible until highlight is confirmed
    useEffect(() => {
        if (selectionInfo && selectionRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(selectionRange);
        }
    }, [selectionInfo, selectionRange]);

    useEffect(() => {
        let objectUrl = null;
        let isMounted = true;
        const fetchPDF = async () => {
            setLoading(true);
            setError(null);
            try {
                console.time('fetch PDF');
                const token = getToken();
                const res = await fetch(`http://localhost:5000/api/pdfs/${uuid}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) {
                    setPdfUrl(objectUrl);
                }
                console.timeEnd('fetch PDF');
            } catch (err) {
                if (isMounted) setError(err.message || 'Failed to load PDF');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        // Fetch highlights for this PDF
        const fetchHighlights = async () => {
            try {
                console.time('fetchHighlights');
                const token = getToken();
                const res = await fetch(`http://localhost:5000/api/highlights/${uuid}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Failed to fetch highlights');
                const data = await res.json();
                setHighlights(data.map(h => ({
                    ...h,
                    page: h.pageNumber,
                    rect: h.position
                })));
                console.timeEnd('fetchHighlights');
            } catch (err) {
                console.error('Error fetching highlights:', err);
            }
        };
        if (uuid) {
            fetchPDF();
            fetchHighlights();
        }
        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [uuid]);

    if (error) {
        return (
            <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-blue-200 py-10 px-2">
                <div className="text-red-500 bg-white rounded-xl shadow-lg px-8 py-6 mt-32 text-lg font-semibold border border-red-200">Error: {error}</div>
            </div>
        );
    }

    const goToNextPage = () => {
        if (pageNumber < numPages) setPageNumber(pageNumber + 1);
    }
    const goToPrevPage = () => {
        if (pageNumber > 1) setPageNumber(pageNumber - 1);
    }

    // ...existing code...

    const postHighlight = async (openEditor = true) => {
        try {
            const token = getToken();
            const res = await axios.post('http://localhost:5000/api/highlights', {
                pdfId: uuid,
                pageNumber: pageNumber,
                text: selectionInfo.text,
                position: selectionInfo.rect,
                color: highlightColor
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.status === 201) {
                const h = res.data.highlight;
                const normalized = { ...h, page: h.pageNumber, rect: h.position };
                setHighlights(prev => [...prev, normalized]);
                setSelectionInfo(null);
                setSelectionRange(null);
                setCurrentHighlight(normalized); // Open note editor for new highlight (normalized shape)
                // clear any previous error and open note editor
                setError(null);
                // Open the NoteEditor only if requested by the user
                if (openEditor) setIsNoteEditorOpen(true);
            } else if (res.status === 409) {
                setError('Duplicate highlight');
            }
        } catch (err) {
            // Log full error for debugging (network / server / axios details)
            console.error('postHighlight error:', err, err?.response?.data);
            const serverMessage = err?.response?.data?.message || err?.response?.data || null;
            const message = serverMessage ? `Error saving highlight: ${serverMessage}` : (err?.message || 'Error saving highlight');
            setError(message);
        }
    };


    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    }

    // In PdfViewer component, add delete handler and pass to HighlightInjector
    const deleteHighlight = async (id) => {
        try {
            const token = getToken();
            await axios.delete(`http://localhost:5000/api/highlights/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHighlights(prev => prev.filter(h => h._id !== id));
        } catch (err) {
            setError('Failed to delete highlight');
        }
    };


    const handleHighlight = (highlight) => {
        setCurrentHighlight(highlight);
        setIsNoteEditorOpen(true);
    }


    // Move saveNote logic to NoteEditor, but keep a function to update highlights after save
    // Ensure we preserve the client-side shape (page, rect) because backend uses pageNumber/position
    const normalizeHighlight = (h) => ({ ...h, page: h.pageNumber ?? h.page, rect: h.position ?? h.rect });
    const updateHighlightNote = (updatedHighlight) => {
        const normalized = normalizeHighlight(updatedHighlight);
        setHighlights(prev => prev.map(h => (h._id === normalized._id ? { ...h, ...normalized } : h)));
        // Also keep currentHighlight in sync if it's the same item
        setCurrentHighlight(prev => (prev && prev._id === normalized._id ? { ...prev, ...normalized } : prev));
    };


    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-blue-200 py-10 px-2">
            <div className="w-full max-w-4xl flex flex-col items-center">
                {/* Title */}
                <div className="w-full flex justify-center mb-4">
                    <h1 className="text-4xl font-black text-blue-700 tracking-tight drop-shadow-lg bg-white rounded-t-3xl px-10 py-5 border-b-4 border-blue-200 shadow-xl">
                        PDF Viewer
                    </h1>
                </div>
                {/* Container with toolbar and PDF */}
                <div className="relative justify-center w-full bg-white rounded-3xl shadow-2xl border-4 border-blue-200 flex flex-col items-center overflow-hidden">
                    {/* Toolbar */}
                    <div className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 border-b-2 border-blue-100">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={pageNumber <= 1}
                                className={`px-3 py-1 rounded-lg font-semibold shadow transition-all duration-150 border border-blue-200 ${pageNumber <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
                                title="Previous Page"
                            >
                                &larr; Prev
                            </button>
                            <span className="text-blue-700 font-bold text-lg select-none">
                                Page {pageNumber} of {numPages}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={pageNumber >= numPages}
                                className={`px-3 py-1 rounded-lg font-semibold shadow transition-all duration-150 border border-blue-200 ${pageNumber >= numPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
                                title="Next Page"
                            >
                                Next &rarr;
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Color picker */}
                            {["#ffe066", "#ffb3b3", "#b3e6ff", "#baffc9", "#d1b3ff"].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setHighlightColor(color)}
                                    style={{
                                        background: color,
                                        border: highlightColor === color ? '2px solid #333' : '1px solid #ccc',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        marginRight: 4,
                                        cursor: 'pointer',
                                        outline: 'none',
                                    }}
                                    title={`Highlight color: ${color}`}
                                />
                            ))}
                            {/* Download button removed per request */}
                            {/* Highlight button in toolbar */}
                            <div className="relative">
                                <button
                                    className={`px-3 py-1 rounded-lg font-semibold shadow border border-yellow-400 bg-yellow-300 text-yellow-900 hover:bg-yellow-400 transition-all duration-150 ${(!selectionInfo || isNoteEditorOpen) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!selectionInfo || isNoteEditorOpen}
                                    title="Highlight selected text"
                                    onMouseDown={e => {
                                        // Restore selection before click is processed
                                        if (selectionInfo && selectionRange) {
                                            const sel = window.getSelection();
                                            sel.removeAllRanges();
                                            sel.addRange(selectionRange);
                                        }
                                    }}
                                    onClick={async () => {
                                        if (!selectionInfo || !selectionRange) return;
                                        // Open our custom confirm modal to choose whether to open note editor
                                        setIsConfirmOpen(true);
                                        // keep selection until user chooses; store default pending choice
                                        setPendingOpenEditor(true);
                                    }}
                                >
                                    Highlight
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* PDF Display */}
                    <div className="w-full flex flex-col items-center px-2 py-8 bg-gradient-to-br from-white via-blue-50 to-blue-100">
                        {pdfUrl && (
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={err => setError('PDF Load Error: ' + err.message)}
                                loading={<div className='text-blue-500'>Loading PDF...</div>}
                            >
                                <div className="relative flex justify-center">
                                    <Page
                                        key={`page_${pageNumber}`}
                                        pageNumber={pageNumber}
                                        width={Math.min(800, window.innerWidth - 64)}
                                        className="mb-6 rounded-xl border-2 border-blue-200 shadow-2xl bg-white"
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        onRenderTextLayerSuccess={() => {
                                            // After the text layer is rendered, attach the ref
                                            const textLayer = document.querySelector('.react-pdf__Page__textContent');
                                            if (textLayer) textLayerRef.current = textLayer;
                                        }}
                                        onMouseUp={(e) => {
                                            const selection = window.getSelection();
                                            if (selection.rangeCount > 0) {
                                                const range = selection.getRangeAt(0);
                                                const text = selection.toString();
                                                if (!text) {
                                                    setSelectionInfo(null);
                                                    setSelectionRange(null);
                                                    return;
                                                }
                                                let textLayer = textLayerRef.current;
                                                if (!textLayer) {
                                                    textLayer = e.target.closest('.react-pdf__Page__textContent');
                                                }
                                                if (!textLayer) return;
                                                const rect = range.getBoundingClientRect();
                                                const textLayerRect = textLayer.getBoundingClientRect();
                                                setSelectionInfo({
                                                    text,
                                                    rect: {
                                                        top: rect.top - textLayerRect.top,
                                                        left: rect.left - textLayerRect.left,
                                                        width: rect.width,
                                                        height: rect.height
                                                    }
                                                });
                                                setSelectionRange(range.cloneRange());
                                            } else {
                                                setSelectionInfo(null);
                                                setSelectionRange(null);
                                            }
                                        }}
                                    />
                                    {/* Fake selection overlay */}
                                    {selectionInfo && selectionInfo.rect && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: selectionInfo.rect.top,
                                                left: selectionInfo.rect.left,
                                                width: selectionInfo.rect.width,
                                                height: selectionInfo.rect.height,
                                                background: 'rgba(51, 153, 255, 0.3)', // blue selection color
                                                borderRadius: 3,
                                                pointerEvents: 'none',
                                                zIndex: 10
                                            }}
                                        />
                                    )}
                                    {isNoteEditorOpen && (
                                        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                                            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                                                <NoteEditor
                                                    note={currentHighlight?.note || ''}
                                                    highlight={currentHighlight}
                                                    saveNote={async (highlight, note) => {
                                                        try {
                                                            const token = getToken();
                                                            const res = await axios.put(`http://localhost:5000/api/highlights/${highlight._id}`, { note }, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            if (res.status === 200) {
                                                                // Normalize before updating so frontend keeps page/rect
                                                                const updated = res.data.highlight;
                                                                const normalized = { ...updated, page: updated.pageNumber ?? updated.page, rect: updated.position ?? updated.rect };
                                                                updateHighlightNote(normalized);
                                                                return normalized;
                                                            }
                                                        } catch (err) {
                                                            setError('Failed to save note');
                                                            throw err;
                                                        }
                                                    }}
                                                    onClose={() => setIsNoteEditorOpen(false)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {/* Custom confirm modal for highlight -> note choice */}
                                    {isConfirmOpen && (
                                        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-40">
                                            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                                                <div className="text-lg font-semibold mb-3">Add a note to this highlight?</div>
                                                <div className="text-sm text-gray-600 mb-4">You can add a note now or save the highlight without a note.</div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                                        onClick={() => {
                                                            // Cancel: just close modal and leave selection untouched
                                                            setIsConfirmOpen(false);
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 rounded bg-yellow-300 text-yellow-900 font-semibold hover:bg-yellow-400"
                                                        onClick={async () => {
                                                            // Save only (no note)
                                                            setIsConfirmOpen(false);
                                                            // clear selection in document before posting
                                                            window.getSelection().removeAllRanges();
                                                            await postHighlight(false);
                                                        }}
                                                    >
                                                        Save without note
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                                                        onClick={async () => {
                                                            // Save and open note editor
                                                            setIsConfirmOpen(false);
                                                            window.getSelection().removeAllRanges();
                                                            await postHighlight(true);
                                                        }}
                                                    >
                                                        Add a note
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <HighlightInjector
                                        textLayerRef={textLayerRef}
                                        highlights={highlights.filter(h => h.page === pageNumber)}
                                        onDelete={deleteHighlight}
                                        onEdit={handleHighlight} // Pass this prop
                                    />
                                </div>
                            </Document>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// Component to inject highlights and button into the text layer
function HighlightInjector({ textLayerRef, highlights, onDelete, onEdit }) {
    const [hovered, setHovered] = React.useState(null);
    return (
        <>
            {highlights.map((h, i) => {
                // Calculate icon position: below the highlight, centered horizontally
                const iconSize = 18;
                const iconTop = h.rect.top + h.rect.height + 4; // 4px gap below
                const iconLeft = h.rect.left + (h.rect.width / 2) - (iconSize / 2);
                return (
                    <React.Fragment key={h._id || i}>
                        <div
                            className="pdf-highlight-overlay"
                            style={{
                                position: 'absolute',
                                top: Math.max(0, h.rect.top - 6),
                                left: Math.max(0, h.rect.left - 6),
                                width: h.rect.width + 12,
                                height: h.rect.height + 12,
                                background: h.color || '#ffe066',
                                opacity: 0.55,
                                pointerEvents: 'auto',
                                borderRadius: 6,
                                zIndex: 1000,
                                transition: 'transform 120ms ease, box-shadow 120ms ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                touchAction: 'manipulation',
                                cursor: 'pointer'
                            }}
                            title={h.note || ''}
                            onClick={() => { onEdit && onEdit(h); }}
                            onMouseEnter={() => setHovered(h._id || i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Delete button, visible when this overlay is hovered */}
                            {h._id && onDelete && hovered === (h._id || i) && (
                                <button
                                    onClick={e => { e.stopPropagation(); onDelete(h._id); }}
                                    title="Delete highlight"
                                    style={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 6,
                                        background: 'rgba(220,38,38,0.95)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 22,
                                        height: 22,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        opacity: 0.98,
                                        zIndex: 1101,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        {/* Message icon if note exists, rendered below the highlight */}
                        {h.note && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: iconTop,
                                    left: iconLeft,
                                    zIndex: 1101,
                                    background: 'rgba(255,255,255,0.85)',
                                    borderRadius: '50%',
                                    padding: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                }}
                                title="This highlight has a note"
                            >
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#2563eb' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h8m-8-8h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.8L3 21l1.8-4A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default PdfViewer;

















