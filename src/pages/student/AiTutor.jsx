import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

function getToken() {
  return localStorage.getItem('access_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AiTutorSkeleton() {
  return (
    <MainLayout title="Student Portal">
      <div className="p-8 h-[calc(100vh-80px)] flex flex-col gap-6 overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex justify-between items-end">
          <div>
            <Skeleton className="w-64 h-9 mb-2" />
            <Skeleton className="w-96 h-5" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-24 h-10 rounded-md" />
            <Skeleton className="w-32 h-10 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* Left Panel Skeleton */}
          <div className="col-span-12 lg:col-span-3 h-full flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b">
              <Skeleton className="w-20 h-3" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-4 py-3 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="w-32 h-4 flex-1" />
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="w-12 h-3 rounded-full" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-48 h-3 mt-1" />
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <Skeleton className="w-full h-8 rounded-lg" />
            </div>
          </div>

          {/* Chat Window Skeleton */}
          <div className="col-span-12 lg:col-span-9 h-full flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Chat Header Skeleton */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="w-40 h-5" />
                <Skeleton className="w-16 h-4 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-20 h-3" />
                <div className="flex gap-2">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="w-9 h-9 rounded-full" />
                </div>
              </div>
            </div>

            {/* Messages Area Skeleton */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
              {/* AI Message Skeleton */}
              <div className="flex justify-start items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="max-w-[80%] bg-white p-5 rounded-2xl rounded-tl-none">
                  <Skeleton className="w-64 h-4 mb-2" />
                  <Skeleton className="w-96 h-4 mb-2" />
                  <Skeleton className="w-80 h-4 mb-2" />
                  <Skeleton className="w-56 h-4" />
                  <Skeleton className="w-32 h-3 mt-3" />
                </div>
              </div>

              {/* User Message Skeleton */}
              <div className="flex justify-end items-start gap-3">
                <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tr-none">
                  <Skeleton className="w-48 h-4 mb-2" />
                  <Skeleton className="w-64 h-4" />
                  <Skeleton className="w-20 h-3 mt-2" />
                </div>
              </div>

              {/* Another AI Message Skeleton */}
              <div className="flex justify-start items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="max-w-[80%] bg-white p-5 rounded-2xl rounded-tl-none">
                  <Skeleton className="w-72 h-4 mb-2" />
                  <Skeleton className="w-88 h-4 mb-2" />
                  <Skeleton className="w-64 h-4" />
                  <Skeleton className="w-32 h-3 mt-3" />
                </div>
              </div>
            </div>

            {/* Input Bar Skeleton */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-2">
                <Skeleton className="flex-1 h-11 rounded-xl" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <Skeleton className="w-64 h-3 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function NewConvModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: title.trim(), subject: subject.trim(), class_level: classLevel.trim() }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) { const d = await res.json(); setError(d.detail || 'Failed to create'); return; }
      const conv = await res.json();
      onCreate(conv);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-on-surface">New Session</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2 mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Session Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Quantum Mechanics Help"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Physics"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Class Level</label>
            <input
              value={classLevel}
              onChange={e => setClassLevel(e.target.value)}
              placeholder="e.g. Grade 10"
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white text-sm font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Start Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 mx-4">
        <p className="text-sm text-on-surface leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-outline-variant/30 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}

function TrashView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [emptyingAll, setEmptyingAll] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/trash/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setItems(data.results || data);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function restore(id) {
    await fetch(`${API_BASE}/tutor/conversations/${id}/restore/`, { method: 'POST', headers: authHeaders() });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function permDelete(id) {
    await fetch(`${API_BASE}/tutor/conversations/${id}/permanent-delete/`, { method: 'DELETE', headers: authHeaders() });
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirm(null);
  }

  async function emptyTrash() {
    setEmptyingAll(true);
    await fetch(`${API_BASE}/tutor/conversations/empty-trash/`, { method: 'DELETE', headers: authHeaders() });
    setItems([]);
    setConfirm(null);
    setEmptyingAll(false);
  }

  return (
    <div className="p-8 flex-1 flex flex-col gap-4">
      {confirm && (
        <ConfirmDialog
          message={confirm.type === 'all'
            ? `Empty Trash? This will permanently delete all ${items.length} conversations and cannot be undone.`
            : "This will permanently delete this conversation and cannot be undone."}
          onConfirm={() => confirm.type === 'all' ? emptyTrash() : permDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-extrabold font-headline text-on-surface">Trash</h2>
            <p className="text-xs text-on-surface-variant">Items may be permanently deleted after 30 days</p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={() => setConfirm({ type: 'all' })} disabled={emptyingAll}
            className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60">
            {emptyingAll ? 'Emptying…' : 'Empty Trash'}
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30">delete</span>
          <p className="text-sm">Your trash is empty</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-outline-variant/10 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{item.title}</p>
                {item.subject && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.subject}</span>}
                <p className="text-xs text-on-surface-variant mt-1">Deleted on {new Date(item.deleted_at).toLocaleDateString()}</p>
                {item.last_message_preview && <p className="text-xs text-on-surface-variant/70 truncate mt-0.5">{item.last_message_preview}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => restore(item.id)} className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5">Restore</button>
                <button onClick={() => setConfirm({ type: 'single', id: item.id })} className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">Delete Forever</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiTutor() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [toast, setToast] = useState(null);
  const [retryBanner, setRetryBanner] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const toastTimerRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : (data.results || []));
    } catch { }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  async function openConversation(id) {
    setLoadingChat(true);
    setRetryBanner(false);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/${id}/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.status === 404) { loadConversations(); return; }
      const data = await res.json();
      setActiveConv(data);
    } catch { }
    finally { setLoadingChat(false); }
  }

  async function sendMessage() {
    if (!inputMsg.trim() || !activeConv || isTyping) return;
    const text = inputMsg.trim();
    setInputMsg('');
    setRetryBanner(false);
    const tempUserMsg = { id: `temp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() };
    setActiveConv(prev => ({ ...prev, messages: [...(prev.messages || []), tempUserMsg] }));
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/chat/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ conversation_id: activeConv.id, message: text }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.status === 400) {
        const d = await res.json();
        setActiveConv(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== tempUserMsg.id) }));
        setRetryBanner(d.detail || 'Could not send. The conversation may be in trash.');
        return;
      }
      if (!res.ok) { setRetryBanner(true); return; }
      const aiMsg = await res.json();
      setActiveConv(prev => ({ ...prev, messages: [...(prev.messages || []), aiMsg] }));
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, last_message_preview: aiMsg.content.slice(0, 100), updated_at: aiMsg.created_at }
          : c
      ));
    } catch {
      setRetryBanner(true);
    } finally {
      setIsTyping(false);
    }
  }

  async function softDelete(id) {
    const res = await fetch(`${API_BASE}/tutor/conversations/${id}/soft-delete/`, { method: 'POST', headers: authHeaders() });
    if (!res.ok) return;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv?.id === id) setActiveConv(null);
    setConfirmDelete(null);
    clearTimeout(toastTimerRef.current);
    setToast({ msg: 'Moved to Trash', undoId: id });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }

  async function undoDelete(id) {
    clearTimeout(toastTimerRef.current);
    setToast(null);
    await fetch(`${API_BASE}/tutor/conversations/${id}/restore/`, { method: 'POST', headers: authHeaders() });
    loadConversations();
  }

  function handleCreated(conv) {
    setShowNewModal(false);
    setConversations(prev => [conv, ...prev]);
    openConversation(conv.id);
  }

  // Show skeleton while loading conversations
  if (loadingConvs && conversations.length === 0) return <AiTutorSkeleton />;

  if (showTrash) return <MainLayout title="Student Portal"><TrashView onBack={() => setShowTrash(false)} /></MainLayout>;

  return (
    <MainLayout title="Student Portal">
      {showNewModal && <NewConvModal onClose={() => setShowNewModal(false)} onCreate={handleCreated} />}
      {confirmDelete && (
        <ConfirmDialog
          message="Move this conversation to Trash? You can restore it later."
          onConfirm={() => softDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          <span>{toast.msg}</span>
          <button onClick={() => undoDelete(toast.undoId)} className="font-bold text-primary-container underline">Undo</button>
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="p-8 h-[calc(100vh-80px)] flex flex-col gap-6 overflow-hidden">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">AI Intelligent Tutor</h2>
            <p className="text-on-surface-variant mt-1">Your personal academic companion powered by ScholarFlow AI.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTrash(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-primary font-medium rounded-md shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">delete</span>
              <span>Trash</span>
            </button>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-md shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-lg">add</span>
              <span>New Session</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">

          {/* ── Left: Conversation List ── */}
          <div className="col-span-12 lg:col-span-3 h-full flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant/5 bg-surface-container-low/40">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sessions</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center h-24 text-xs text-on-surface-variant">Loading…</div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl opacity-30">chat</span>
                  <p className="text-xs">No sessions yet</p>
                  <button onClick={() => setShowNewModal(true)} className="text-xs text-primary font-semibold underline">Start one</button>
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.id} onClick={() => openConversation(conv.id)}
                    className={`group px-4 py-3 cursor-pointer border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors relative ${activeConv?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-on-surface truncate flex-1">{conv.title}</p>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-on-surface-variant hover:text-red-500 transition-all shrink-0">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.subject && <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{conv.subject}</span>}
                      <span className="text-[10px] text-on-surface-variant/60">{timeAgo(conv.updated_at)}</span>
                    </div>
                    {conv.last_message_preview && (
                      <p className="text-[10px] text-on-surface-variant/70 mt-1 truncate">{conv.last_message_preview}</p>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-outline-variant/5">
              <button onClick={() => setShowTrash(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
                Recently Deleted
              </button>
            </div>
          </div>

          {/* ── Chat Window — now col-span-9 (full right side) ── */}
          <div
            className="col-span-12 lg:col-span-9 h-full flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-low/30">
              {activeConv ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-on-surface">{activeConv.title}</span>
                  {activeConv.subject && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{activeConv.subject}</span>}
                  {activeConv.class_level && <span className="text-[9px] text-on-surface-variant/60">{activeConv.class_level}</span>}
                </div>
              ) : (
                <span className="text-sm text-on-surface-variant">Select a session to start</span>
              )}
              <div className="flex items-center gap-3">
                {activeConv && (
                  <span className="text-[10px] text-on-surface-variant/50">{activeConv.message_count || 0} messages</span>
                )}
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full border-2 border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-sm">hearing</span>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-sm">mic</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30"
            >
              {loadingChat ? (
                <div className="flex items-center justify-center h-full text-sm text-on-surface-variant">Loading messages…</div>
              ) : !activeConv ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl opacity-20">smart_toy</span>
                  <p className="text-sm font-medium">Pick a session or start a new one</p>
                  <button onClick={() => setShowNewModal(true)} className="text-sm text-primary font-semibold underline">New Session</button>
                </div>
              ) : (activeConv.messages || []).filter(m => m.role !== 'system').map(msg => (
                msg.role === 'user' ? (
                  /* User bubble — white with border */
                  <div key={msg.id} className="flex justify-end items-start gap-3">
                    <div className="max-w-[70%] bg-white text-on-surface border border-outline-variant/30 p-4 rounded-2xl rounded-tr-none shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[10px] mt-2 block opacity-50 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ) : (
                  /* AI bubble — markdown rendered */
                  <div key={msg.id} className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <div className="max-w-[80%] bg-white border border-outline-variant/10 p-5 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="text-sm leading-relaxed text-on-surface prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-on-surface prose-p:my-1.5 prose-strong:font-semibold prose-ul:my-2 prose-ul:pl-4 prose-ol:my-2 prose-ol:pl-4 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <span className="text-[10px] mt-3 block opacity-40">AI Generated · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                  <div className="bg-white border border-outline-variant/10 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Retry Banner */}
            {retryBanner && (
              <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <p className="text-xs text-red-600">{typeof retryBanner === 'string' ? retryBanner : 'Something went wrong. Please try again.'}</p>
                <button onClick={() => setRetryBanner(false)} className="text-red-400 hover:text-red-600 ml-3">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-outline-variant/10">
              <div className="flex items-center gap-2">
                <input
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={!activeConv || isTyping}
                  placeholder={activeConv ? `Ask anything about ${activeConv.subject || 'your subject'}…` : 'Select a session first'}
                  className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!activeConv || !inputMsg.trim() || isTyping}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md hover:bg-primary-container transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/50 italic text-center mt-2">AI Tutor can make mistakes. Verify important information.</p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}