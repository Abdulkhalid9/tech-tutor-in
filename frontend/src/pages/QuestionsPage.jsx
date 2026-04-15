/**
 * Browse Library — Document Viewer
 * Sidebar list of Q&As with a Google-Docs-style two-page viewer.
 * PDF attachments rendered inline via react-pdf.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import toast from 'react-hot-toast';
import './BrowseLibrary.css';

// ── PDF.js worker — Vite-native new URL() pattern ────────────
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Normalise backend PDF URLs to relative paths so Vite proxy handles CORS
// e.g. "http://localhost:5000/uploads/Q0.pdf" → "/uploads/Q0.pdf"
function toPdfUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // If same backend host, use relative path (goes through Vite proxy)
    // For local dev, URL might be http://localhost:5000/uploads/...
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
       return parsed.pathname;
    }
  } catch {
    // Already a relative path or non-URL string — return as-is
  }
  return url;
}

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

function getBadgeClass(subject) {
  if (!subject) return 'badge-default';
  const s = subject.toLowerCase();
  if (s.includes('physics'))  return 'badge-physics';
  if (s.includes('chem'))     return 'badge-chemistry';
  if (s.includes('math'))     return 'badge-maths';
  if (s.includes('bio'))      return 'badge-biology';
  return 'badge-general';
}

function formatDate(iso) {
  return new Date(iso || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── PDF Viewer with page navigation ──────────────────────────
const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const resolvedUrl = toPdfUrl(url);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="pdf-embed-wrapper">
      <Document
        file={resolvedUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={(err) => { console.error('PDF load error:', err); toast.error('Failed to load PDF'); }}
        loading={
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            Loading PDF…
          </div>
        }
      >
        <div className="pdf-page-wrapper">
          <Page
            pageNumber={pageNumber}
            className="pdf-page-canvas"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={750}
          />
        </div>
      </Document>

      {numPages && numPages > 1 && (
        <div className="pdf-nav-controls">
          <button
            className="pdf-nav-btn"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => p - 1)}
          >
            ← Prev
          </button>
          <span>Page {pageNumber} of {numPages}</span>
          <button
            className="pdf-nav-btn"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// ── Sidebar Question Item ─────────────────────────────────────
const SidebarItem = ({ item, isActive, onClick }) => (
  <div
    className={`sidebar-item${isActive ? ' active' : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
    aria-pressed={isActive}
  >
    <div className="sidebar-item-top">
      <div className="sidebar-item-badges">
        <span className={`subject-badge ${getBadgeClass(item.subject)}`}>
          {item.subject || 'General'}
        </span>
        {item.answerUnlocked && <span className="unlocked-dot" title="Unlocked" />}
      </div>
    </div>
    <p className="sidebar-item-title">{item.title}</p>
    <div className="sidebar-item-meta">
      <span>{formatDate(item.createdAt)}</span>
      <span className="sidebar-price">₹{item.price}</span>
    </div>
  </div>
);

// ── Document Viewer: Q-Page ───────────────────────────────────
const QuestionPage = ({ item }) => (
  <div className="doc-page">
    <div className="doc-page-header">
      <div>
        <div className="doc-page-label q-label">
          <span className="doc-page-label-icon">Q</span>
          Question Page
        </div>
        <h2 className="doc-page-title-text">{item.title}</h2>
        <div className="doc-page-meta-tags">
          <span className="meta-tag">{item.subject || 'General'}</span>
          <span className="meta-tag">Added {formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>

    <div className="doc-page-body">
      <h3>Question</h3>
      <p>{item.description || 'No description provided.'}</p>

      {/* Question attachment */}
      {item.questionFile && item.questionFileType === 'pdf' && (
        <>
          <br />
          <h3>Attached Document</h3>
          <PdfViewer url={item.questionFile} />
        </>
      )}
      {item.questionFile && item.questionFileType === 'image' && (
        <>
          <br />
          <h3>Attached Image</h3>
          <img
            src={item.questionFile}
            alt="Question attachment"
            style={{ maxWidth: '100%', borderRadius: 10, marginTop: '0.75rem', border: '1px solid rgba(31,36,48,0.1)' }}
          />
        </>
      )}
      {item.questionFile && !['pdf', 'image'].includes(item.questionFileType) && (
        <a
          href={item.questionFile}
          target="_blank"
          rel="noreferrer"
          className="doc-attachment-link"
        >
          📎 View Attachment
        </a>
      )}
    </div>
    <div className="doc-page-number">Q · 1</div>
  </div>
);

// ── Document Viewer: A-Page ───────────────────────────────────
const AnswerPage = ({ item, onUnlock }) => {
  const [unlocking, setUnlocking] = useState(false);
  const [localUnlocked, setLocalUnlocked] = useState(item.answerUnlocked);

  // Sync if parent re-renders with updated item
  useEffect(() => {
    setLocalUnlocked(item.answerUnlocked);
  }, [item.answerUnlocked]);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await onUnlock(item._id);
      setLocalUnlocked(true);
      toast.success('Answer unlocked! 🎉');
    } catch {
      toast.error('Failed to unlock. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const blurText =
    'The solution involves applying key principles systematically. ' +
    'Each step leads logically to the next, with complete working shown. ' +
    'Diagrams and derivations are included where required for clarity.';

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div>
          <div className="doc-page-label a-label">
            <span className="doc-page-label-icon">A</span>
            Answer Page
          </div>
          <h2 className="doc-page-title-text">Tutor&apos;s Solution</h2>
          <div className="doc-page-meta-tags">
            <span className="meta-tag">Expert-verified</span>
            {localUnlocked
              ? <span className="meta-tag" style={{ color: '#166534', background: 'rgba(21,128,61,0.1)' }}>✓ Unlocked</span>
              : <span className="meta-tag" style={{ color: '#9a3412', background: 'rgba(234,88,12,0.1)' }}>🔒 Locked</span>
            }
          </div>
        </div>
      </div>

      {localUnlocked ? (
        /* ── Unlocked: show full solution ── */
        <div className="doc-page-body">
          <h3>Solution</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{item.solution || 'No written solution provided.'}</p>

          {/* Answer PDF */}
          {item.answerFile && item.answerFileType === 'pdf' && (
            <>
              <br />
              <h3>Answer Document</h3>
              <PdfViewer url={item.answerFile} />
            </>
          )}

          {/* Answer image */}
          {item.answerFile && item.answerFileType === 'image' && (
            <>
              <br />
              <h3>Answer Reference</h3>
              <img
                src={item.answerFile}
                alt="Answer attachment"
                className="answer-image-full"
              />
            </>
          )}

          {/* Other file type */}
          {item.answerFile && !['pdf', 'image'].includes(item.answerFileType) && (
            <a
              href={item.answerFile}
              target="_blank"
              rel="noreferrer"
              className="doc-attachment-link"
              style={{ marginTop: '1rem' }}
            >
              📎 Download Answer File
            </a>
          )}
        </div>
      ) : (
        /* ── Locked: blur + unlock CTA ── */
        <div className="locked-answer-page">
          <div className="locked-blur-preview" aria-hidden="true">
            {blurText}
          </div>
          <div className="lock-cta">
            <div className="lock-icon-big">🔒</div>
            <h4>Answer is Locked</h4>
            <p>Unlock this answer to view the complete step-by-step solution from a verified tutor.</p>
            <button
              className="btn-unlock-doc"
              onClick={handleUnlock}
              disabled={unlocking}
              aria-label={`Unlock answer for ₹${item.price}`}
            >
              {unlocking ? 'Unlocking…' : `🔓 Unlock for ₹${item.price}`}
            </button>
          </div>
        </div>
      )}

      <div className="doc-page-number">A · 2</div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
const BrowseLibraryPage = () => {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeSubject, setSubject] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const lastScrollRef = useRef(0);

  const handleDocScroll = useCallback((e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollRef.current && currentScrollY > 50) {
      window.dispatchEvent(new CustomEvent('navbar-visibility', { detail: { visible: false } }));
    } else if (currentScrollY < lastScrollRef.current) {
      window.dispatchEvent(new CustomEvent('navbar-visibility', { detail: { visible: true } }));
    }
    lastScrollRef.current = currentScrollY;
  }, []);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/qa');
      const data = res.data.data || [];
      setItems(data);
      // Auto-select first item
      if (data.length > 0) setSelectedId(data[0]._id);
    } catch {
      toast.error('Could not load the library. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLibrary(); }, [loadLibrary]);

  const handleUnlock = useCallback(async (questionId) => {
    await api.post(`/qa/mock-unlock/${questionId}`);
    setItems(prev =>
      prev.map(q => q._id === questionId ? { ...q, answerUnlocked: true } : q)
    );
  }, []);

  const filtered = useMemo(() => {
    return items.filter(q => {
      const matchSubject =
        activeSubject === 'All' ||
        (q.subject && q.subject.toLowerCase().includes(activeSubject.toLowerCase()));
      const matchSearch =
        !search.trim() ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(search.toLowerCase()));
      return matchSubject && matchSearch;
    });
  }, [items, activeSubject, search]);

  const selectedItem = useMemo(
    () => items.find(q => q._id === selectedId) || null,
    [items, selectedId]
  );

  // Auto-select first item whenever filter/search changes
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find(q => q._id === selectedId)) {
      setSelectedId(filtered[0]._id);
    }
  }, [filtered, selectedId]);

  return (
    <div className="library-root">
      {/* ── Top Bar ── */}
      <div className="library-topbar">
        <div className="library-topbar-left">
          <div className="library-logo-area">
            <h1>📚 Browse Library</h1>
            <p>
              Solved JEE &amp; NEET questions by expert tutors
              {user?.role === 'student' && ' · Unlock to access full solutions'}
            </p>
          </div>

          <div className="library-topbar-divider" />

          {/* Search */}
          <div className="library-search-wrapper">
            <span className="library-search-icon">🔍</span>
            <input
              id="library-search"
              type="search"
              className="library-search"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search library questions"
            />
          </div>

          {!loading && (
            <span className="library-count-chip">
              {filtered.length} / {items.length}
            </span>
          )}
        </div>

        {/* Subject filters */}
        <div className="library-filters" role="group" aria-label="Filter by subject">
          {SUBJECTS.map(s => (
            <button
              key={s}
              className={`filter-pill${activeSubject === s ? ' active' : ''}`}
              onClick={() => setSubject(s)}
              aria-pressed={activeSubject === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Workspace ── */}
      {loading ? (
        <div className="library-loading-full">
          <div className="lib-spinner" />
          <p>Loading library…</p>
        </div>
      ) : (
        <div className="library-workspace">
          {/* Sidebar */}
          {isSidebarOpen && (
            <aside className="library-sidebar" aria-label="Question list">
              <div className="sidebar-header">
                <span>{filtered.length} Question{filtered.length !== 1 ? 's' : ''}</span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="sidebar-toggle-btn"
                  aria-label="Hide Sidebar"
                  title="Hide sidebar"
                >
                  ◀
                </button>
              </div>
            <div className="sidebar-list">
              {filtered.length === 0 ? (
                <div className="sidebar-empty">
                  <div className="sidebar-empty-icon">🔭</div>
                  <p>
                    {search || activeSubject !== 'All'
                      ? 'No matches. Try a different search or filter.'
                      : 'No answered questions yet.'}
                  </p>
                </div>
              ) : (
                filtered.map(item => (
                  <SidebarItem
                    key={item._id}
                    item={item}
                    isActive={item._id === selectedId}
                    onClick={() => setSelectedId(item._id)}
                  />
                ))
              )}
            </div>
          </aside>
          )}

          {/* Document Viewer */}
          <main className="library-viewer" aria-label="Document viewer">
            {!selectedItem ? (
              <div className="viewer-empty-state">
                <div className="viewer-empty-icon">📄</div>
                <h3>Select a question</h3>
                <p>Choose a question from the list on the left to view its document.</p>
              </div>
            ) : (
              <div className="doc-viewer-wrapper">
                {/* Toolbar */}
                <div className="doc-toolbar">
                  <div className="doc-toolbar-left">
                    <div className="doc-toolbar-subject">
                      {!isSidebarOpen && (
                        <button 
                          onClick={() => setSidebarOpen(true)}
                          className="sidebar-toggle-btn"
                          aria-label="Show Sidebar"
                          title="Show sidebar"
                        >
                          ▶
                        </button>
                      )}
                      <span className={`subject-badge ${getBadgeClass(selectedItem.subject)}`}>
                        {selectedItem.subject || 'General'}
                      </span>
                    </div>
                    <div className="doc-title">{selectedItem.title}</div>
                    <div className="doc-date">Added {formatDate(selectedItem.createdAt)}</div>
                  </div>
                  <div className="doc-toolbar-actions">
                    {selectedItem.answerUnlocked ? (
                      <span className="doc-unlocked-badge">✓ Answer Unlocked</span>
                    ) : (
                      <span className="doc-price-badge">₹{selectedItem.price}</span>
                    )}
                  </div>
                </div>

                {/* Pages scroll area */}
                <div 
                  className="doc-pages-scroll" 
                  style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}
                  onScroll={handleDocScroll}
                >
                  {/* Q-Page */}
                  <QuestionPage item={selectedItem} />

                  {/* A-Page */}
                  <AnswerPage item={selectedItem} onUnlock={handleUnlock} />
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default BrowseLibraryPage;
