/**
 * Browse Library Page
 * Displays all answered Q&As with search, subject filters and mock unlock.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import toast from 'react-hot-toast';
import './BrowseLibrary.css';

// Subject filter options
const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

// ── Helper: resolve badge class from subject string ────────
function getBadgeClass(subject) {
  if (!subject) return 'badge-default';
  const s = subject.toLowerCase();
  if (s.includes('physics'))   return 'badge-physics';
  if (s.includes('chem'))      return 'badge-chemistry';
  if (s.includes('math'))      return 'badge-maths';
  if (s.includes('bio'))       return 'badge-biology';
  return 'badge-general';
}

// ── Single Q&A Card ────────────────────────────────────────
const QACard = ({ item, onUnlock }) => {
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(item.answerUnlocked);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await onUnlock(item._id);
      setUnlocked(true);
      toast.success('Answer unlocked! 🎉');
    } catch {
      toast.error('Failed to unlock answer. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const blurPlaceholder =
    'The solution to this problem involves applying core principles from the topic. ' +
    'A step-by-step approach leads to the correct answer. ' +
    'Unlock to view the complete working and explanation.';

  return (
    <div className="qa-card">
      {/* Header */}
      <div className="qa-card-header">
        <span className={`subject-badge ${getBadgeClass(item.subject)}`}>
          {item.subject || 'General'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {unlocked && (
            <span className="qa-unlocked-badge">✓ Unlocked</span>
          )}
          <span className="qa-price">₹{item.price}</span>
        </div>
      </div>

      {/* Body */}
      <div className="qa-card-body">
        <h3 className="qa-card-title">{item.title}</h3>
        <p className="qa-card-desc">{item.description}</p>
      </div>

      {/* Answer Panel */}
      <div className="answer-panel">
        <div className="answer-panel-header">
          <span className="answer-label">💡 Tutor Answer</span>
        </div>

        {unlocked ? (
          /* ── Unlocked ── */
          <div className="answer-unlocked unlock-success-panel">
            <p className="solution-text">{item.solution || 'No solution text provided.'}</p>
            {item.answerFile && item.answerFileType === 'image' && (
              <img
                src={item.answerFile}
                alt="Answer attachment"
                className="solution-image"
              />
            )}
            {item.answerFile && item.answerFileType === 'pdf' && (
              <a
                href={item.answerFile}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.75rem', display: 'inline-flex' }}
              >
                📄 View PDF
              </a>
            )}
          </div>
        ) : (
          /* ── Locked ── */
          <div className="answer-locked">
            <p className="answer-blur-text">{blurPlaceholder}</p>
            <div className="answer-lock-overlay">
              <span className="lock-icon">🔒</span>
              <button
                className="btn-unlock"
                onClick={handleUnlock}
                disabled={unlocking}
              >
                {unlocking ? 'Unlocking…' : `Unlock for ₹${item.price}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="qa-card-footer">
        Added {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────
const BrowseLibraryPage = () => {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeSubject, setSubject] = useState('All');

  // Fetch all answered Q&As
  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/qa');
      setItems(res.data.data || []);
    } catch {
      toast.error('Could not load the library. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLibrary(); }, [loadLibrary]);

  // Mock unlock: directly flips the flag on the backend without payment
  const handleUnlock = useCallback(async (questionId) => {
    // Mock: call backend unlock route without payment verification
    await api.post(`/qa/mock-unlock/${questionId}`);
    // Optimistically update local state
    setItems(prev =>
      prev.map(q => q._id === questionId ? { ...q, answerUnlocked: true } : q)
    );
  }, []);

  // Filter client-side
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

  return (
    <div className="library-page">
      {/* Hero header */}
      <div className="library-header">
        <div className="library-header-text">
          <p className="section-kicker">📚 Question Bank</p>
          <h1>Browse Library</h1>
          <p>
            Explore solved JEE &amp; NEET questions answered by expert tutors.
            {user?.role === 'student' && ' Unlock answers to access complete solutions.'}
          </p>
        </div>
        {!loading && (
          <span className="library-count">
            {filtered.length} of {items.length} result{items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="library-controls">
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
          />
        </div>

        {/* Subject filters */}
        <div className="library-filters">
          {SUBJECTS.map(s => (
            <button
              key={s}
              className={`filter-btn${activeSubject === s ? ' active' : ''}`}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="library-loading">
          <div className="library-spinner" />
          <p>Loading library…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">🔭</div>
          <h3>No questions found</h3>
          <p>
            {search || activeSubject !== 'All'
              ? 'Try a different keyword or subject filter.'
              : 'No answered questions in the library yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="library-grid">
          {filtered.map(item => (
            <QACard key={item._id} item={item} onUnlock={handleUnlock} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseLibraryPage;
