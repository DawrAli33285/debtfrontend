import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getChatRooms, getChatMessages, sendMessage, BASE_URL } from '../api/auth';
import { useSocket } from '../components/usesocket'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

const STATUS_STYLES = {
  in_progress: { color: '#2563eb', bg: '#eff6ff', label: 'In Progress' },
  assigned:    { color: '#0f5189', bg: '#e8f2fa', label: 'Assigned' },
  closed:      { color: '#16a34a', bg: '#f0fdf4', label: 'Closed' },
  submitted:   { color: '#6b7280', bg: '#f3f4f6', label: 'Submitted' },
};

const getIdFromToken = (tokenKey) => {
  const token = localStorage.getItem(tokenKey);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || payload.userId || payload.agencyId;
  } catch {
    return null;
  }
};

export default function Chat() {
  const [rooms, setRooms]                     = useState([]);
  const [activeRoom, setActiveRoom]           = useState(null);
  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState('');
  const [sending, setSending]                 = useState(false);
  const [pendingFile, setPendingFile]         = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [loadingRooms, setLoadingRooms]       = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError]                     = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const currentUserId = getIdFromToken('token');
  const [searchParams] = useSearchParams();

  const { sendSocketMessage } = useSocket(
    activeRoom?._id,
    (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });
      setRooms(prev => prev.map(r =>
        r._id === msg.room_id
          ? { ...r, last_message: { text: msg.text || '📎 File', created_at: msg.created_at } }
          : r
      ));
    }
  );

  useEffect(() => {
    const load = async () => {
      setLoadingRooms(true);
      try {
        setRooms(prev => prev.map(r => r._id === room._id ? { ...r, unread: 0 } : r));
        const res = await getChatRooms();
        if (res.rooms?.length) {
          const claimId = searchParams.get('claim');
          const normalized = res.rooms.map(r => ({
            _id:          r._id,
            agency: {
              name:     r.agency_id?.name || 'Agency',
              initials: getInitials(r.agency_id?.name),
            },
            claim: {
              debtor_name: r.claim_id?.debtor_name || '—',
              description: r?.claim_id?.description || '',
              amount:      r.claim_id?.amount      || 0,
              status:      r.claim_id?.status      || 'submitted',
            },
            last_message: r.last_message || null,
            unread:       r.unread       || 0,
          }));
          setRooms(normalized);
          const target = claimId
            ? normalized.find(r => r.claim._id === claimId) || normalized[0]
            : normalized[0];
          loadRoom(target);
        }
      } catch {
        setError('Failed to load conversations.');
      }
      setLoadingRooms(false);
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRoom = async (room) => {
    setActiveRoom(room);
    setSidebarOpen(false);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await getChatMessages(room._id);
      if (res.messages) {
        setMessages(res.messages.map(m => ({
          ...m,
          sender:     m.sender_type,
          created_at: m.createdAt,
        })));
      }
    } catch {
      setError('Failed to load messages.');
    }
    setLoadingMessages(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || sending || !activeRoom) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const file = pendingFile;
    setPendingFile(null);

    if (file) {
      const optimisticId = `opt_${Date.now()}`;
      setMessages(prev => [...prev, {
        _id: optimisticId, sender: 'user', text, created_at: new Date(),
        attachment: { original_name: file.name, url: null },
      }]);
      try {
        const form = new FormData();
        form.append('file', file);
        if (text) form.append('text', text);
        const r = await fetch(`${BASE_URL}/chat/${activeRoom._id}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: form,
        });
        const res = await r.json();
        if (res.message) {
          setMessages(prev => prev.filter(m => m._id !== optimisticId));
        }
      } catch {
        setMessages(prev => prev.filter(m => m._id !== optimisticId));
        setError('Failed to send file.');
      }
    } else {
      sendSocketMessage({
        roomId:     activeRoom._id,
        text,
        senderId:   currentUserId,
        senderType: 'user',
      });
    }

    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const grouped = messages.reduce((acc, msg) => {
    const label = fmtDate(msg.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  const st = STATUS_STYLES[activeRoom?.claim?.status] || STATUS_STYLES.assigned;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue:       #1669A9;
          --blue-dark:  #0f5189;
          --blue-light: #e8f2fa;
          --blue-mid:   #c5ddf0;
          --white:      #ffffff;
          --off-white:  #f5f7fa;
          --border:     #e0e7ef;
          --text:       #1a2a3a;
          --text-mid:   #4a6070;
          --text-muted: #7a96a8;
          --error:      #c0392b;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--off-white); }

        .chat-root { display: flex; flex-direction: column; height: 100vh; background: var(--off-white); overflow: hidden; }

        /* ── Navbar ── */
        .chat-nav {
          background: var(--blue); height: 64px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0; z-index: 50; position: relative;
        }
        .chat-nav::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .nav-right { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .nav-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,.65);
          text-decoration: none; border: 1px solid rgba(255,255,255,.2);
          border-radius: 8px; padding: 7px 14px;
          transition: color .15s, border-color .15s, background .15s;
        }
        .nav-back:hover { color: #fff; border-color: rgba(255,255,255,.45); background: rgba(255,255,255,.08); }
        .menu-btn {
          display: none; background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.65); padding: 4px;
        }
        @media (max-width: 700px) { .menu-btn { display: flex; } }

        /* ── Body ── */
        .chat-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* ── Sidebar ── */
        .chat-sidebar {
          width: 300px; flex-shrink: 0;
          background: var(--white); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; overflow: hidden;
          transition: transform .25s cubic-bezier(.22,1,.36,1);
        }
        @media (max-width: 700px) {
          .chat-sidebar {
            position: absolute; left: 0; top: 64px; bottom: 0; z-index: 40;
            transform: translateX(-100%); box-shadow: 4px 0 24px rgba(22,105,169,.12);
          }
          .chat-sidebar.open { transform: translateX(0); }
        }
        .sidebar-head {
          padding: 18px 18px 14px; border-bottom: 1px solid var(--border);
          background: var(--white);
        }
        .sidebar-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
        .sidebar-sub { font-size: 12px; color: var(--text-muted); }
        .room-list { flex: 1; overflow-y: auto; }
        .room-item {
          padding: 14px 18px; cursor: pointer; border-bottom: 1px solid var(--border);
          transition: background .12s; position: relative;
        }
        .room-item:hover { background: var(--off-white); }
        .room-item.active { background: var(--blue-light); border-left: 3px solid var(--blue); }
        .room-item.active .room-agency { color: var(--blue-dark); font-weight: 700; }
        .room-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .room-avatar {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--blue); color: #fff;
          font-size: 11px; font-weight: 700; letter-spacing: .03em;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .room-meta { flex: 1; min-width: 0; }
        .room-agency { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .room-debtor { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .room-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
        .room-preview { font-size: 12px; color: var(--text-muted); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .unread-dot {
          position: absolute; top: 14px; right: 14px;
          width: 18px; height: 18px; border-radius: 99px;
          background: var(--blue); color: #fff;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Skeleton ── */
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--off-white) 25%, var(--border) 50%, var(--off-white) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }
        .room-skel { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }

        /* ── Main ── */
        .chat-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

        /* ── Claim bar ── */
        .claim-bar {
          background: var(--white); border-bottom: 1px solid var(--border);
          padding: 12px 22px; display: flex; align-items: center; gap: 14px; flex-shrink: 0;
          animation: slideDown .3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .claim-bar-avatar {
          width: 38px; height: 38px; border-radius: 11px; background: var(--blue);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .claim-bar-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .claim-bar-sub { font-size: 12px; color: var(--text-muted); }
        .claim-bar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .claim-amount { font-size: 17px; font-weight: 700; color: var(--blue-dark); }
        .status-chip {
          display: inline-flex; align-items: center; padding: 3px 10px;
          border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: .04em;
        }
        .mobile-menu-btn {
          display: none; background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px; margin-right: 4px;
        }
        @media (max-width: 700px) { .mobile-menu-btn { display: flex; } }

        /* ── Messages ── */
        .messages-area {
          flex: 1; overflow-y: auto; padding: 24px 22px;
          display: flex; flex-direction: column;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        .date-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0 16px; font-size: 11px; color: var(--text-muted);
          letter-spacing: .07em; text-transform: uppercase;
        }
        .date-divider::before, .date-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .msg-row {
          display: flex; margin-bottom: 6px;
          animation: msgIn .2s cubic-bezier(.22,1,.36,1);
        }
        @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .msg-row.user   { justify-content: flex-end; }
        .msg-row.agency { justify-content: flex-start; }
        .msg-bubble {
          max-width: 68%; padding: 11px 15px; border-radius: 16px;
          font-size: 13.5px; line-height: 1.55;
        }
        .msg-row.user .msg-bubble {
          background: var(--blue); color: #fff; border-bottom-right-radius: 4px;
        }
        .msg-row.agency .msg-bubble {
          background: var(--white); color: var(--text);
          border: 1px solid var(--border); border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(22,105,169,.06);
        }
        .msg-time { font-size: 10.5px; margin-top: 4px; display: block; }
        .msg-row.user  .msg-time { color: rgba(255,255,255,.5); text-align: right; }
        .msg-row.agency .msg-time { color: var(--text-muted); }
        .agency-label { font-size: 11px; font-weight: 700; color: var(--blue); margin-bottom: 4px; letter-spacing: .04em; }

        /* ── Input bar ── */
        .input-bar {
          background: var(--white); border-top: 1px solid var(--border);
          padding: 14px 18px; display: flex; align-items: flex-end; gap: 10px;
          flex-shrink: 0; position: relative;
        }
        .input-wrap { flex: 1; position: relative; }
        .chat-input {
          width: 100%; background: var(--off-white); border: 1.5px solid var(--border);
          border-radius: 12px; padding: 11px 46px 11px 14px;
          font-size: 13.5px; font-family: inherit; color: var(--text);
          outline: none; resize: none; line-height: 1.5; max-height: 120px;
          transition: border-color .15s, box-shadow .15s;
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:focus { border-color: var(--blue); background: var(--white); box-shadow: 0 0 0 3px rgba(22,105,169,.08); }
        .send-btn {
          position: absolute; right: 8px; bottom: 8px;
          width: 32px; height: 32px; border-radius: 9px;
          background: var(--blue); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s, transform .1s;
        }
        .send-btn:hover:not(:disabled) { background: var(--blue-dark); transform: scale(1.05); }
        .send-btn:disabled { opacity: .4; cursor: not-allowed; }
        .input-hint { font-size: 11px; color: var(--text-muted); text-align: center; padding-bottom: 8px; background: var(--white); }

        /* ── Center states ── */
        .center-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; color: var(--text-muted); padding: 40px; text-align: center;
        }
        .center-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--blue-light); border: 1px solid var(--blue-mid);
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .center-state p { font-size: 14px; font-weight: 600; color: var(--text); }
        .center-state span { font-size: 13px; max-width: 260px; line-height: 1.5; }
        .spinner {
          width: 22px; height: 22px;
          border: 2.5px solid rgba(22,105,169,.15);
          border-top-color: var(--blue); border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Error bar ── */
        .err-bar {
          background: #fdf0ef; border-bottom: 1px solid #f1c0bc;
          color: var(--error); font-size: 12.5px; padding: 8px 22px;
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }
        .err-bar button { background: none; border: none; cursor: pointer; color: var(--error); font-size: 16px; line-height: 1; }
      `}</style>

      <div className="chat-root">

        {/* Navbar */}
        <nav className="chat-nav">
          <div className="nav-right">
            <Link to="/dashboard" className="nav-back">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </Link>
            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* Error bar */}
        {error && (
          <div className="err-bar">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="chat-body">

          {/* Sidebar */}
          <aside className={`chat-sidebar${sidebarOpen ? ' open' : ''}`}>
            <div className="sidebar-head">
              <h2 className="sidebar-title">Messages</h2>
              <p className="sidebar-sub">
                {loadingRooms ? 'Loading…' : `${rooms.length} conversation${rooms.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="room-list">
              {loadingRooms ? (
                [...Array(4)].map((_, i) => (
                  <div className="room-skel" key={i}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="skel" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }}/>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skel" style={{ height: 12, width: '70%' }}/>
                        <div className="skel" style={{ height: 10, width: '50%' }}/>
                      </div>
                    </div>
                    <div className="skel" style={{ height: 10, width: '85%' }}/>
                  </div>
                ))
              ) : rooms.length === 0 ? (
                <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  No conversations yet.<br/>They appear when a claim is assigned to an agency.
                </div>
              ) : (
                rooms.map(room => (
                  <div
                    key={room._id}
                    className={`room-item${activeRoom?._id === room._id ? ' active' : ''}`}
                    onClick={() => loadRoom(room)}
                  >
                    <div className="room-top">
                      <div className="room-avatar">{room.agency.initials}</div>
                      <div className="room-meta">
                        <div className="room-agency">{room.agency.name}</div>
                        <div className="room-debtor">{room.claim.debtor_name}</div>
                      </div>
                      <span className="room-time">{fmtTime(room.last_message?.created_at)}</span>
                    </div>
                    <div className="room-preview">{room.last_message?.text || 'No messages yet'}</div>
                    {room.unread > 0 && <span className="unread-dot">{room.unread}</span>}
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="chat-main">

            {/* No room selected */}
            {!activeRoom && !loadingRooms && (
              <div className="center-state">
                <div className="center-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <p>No conversation selected</p>
                <span>Select a conversation from the sidebar to start messaging.</span>
              </div>
            )}

            {activeRoom && (
              <>
                {/* Claim bar */}
                <div className="claim-bar">
                  <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>

                  <div className="claim-bar-avatar">{activeRoom.agency.initials}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="claim-bar-name">{activeRoom.agency.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div className="claim-bar-sub">vs {activeRoom.claim.debtor_name}</div>
                      {activeRoom.claim.description && (
                        <>
                          <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>
                          <div className="claim-bar-sub" style={{ fontStyle: 'italic' }}>
                            {activeRoom.claim.description}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="claim-bar-right">
                    <span className="claim-amount">{fmt(activeRoom.claim.amount)}</span>
                    <span className="status-chip" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </div>

                {/* Messages area */}
                <div className="messages-area">
                  {loadingMessages ? (
                    <div className="center-state">
                      <div className="spinner" />
                      <span>Loading messages…</span>
                    </div>
                  ) : (
                    <>
                      {Object.entries(grouped).map(([dateLabel, msgs]) => (
                        <div key={dateLabel}>
                          <div className="date-divider">{dateLabel}</div>
                          {msgs.map((msg, i) => {
                            const isUser   = msg.sender === 'user';
                            const prevSame = i > 0 && msgs[i - 1].sender === msg.sender;
                            return (
                              <div
                                key={msg._id}
                                className={`msg-row ${msg.sender}`}
                                style={{ marginBottom: prevSame ? 3 : 10 }}
                              >
                                <div>
                                  {!isUser && !prevSame && (
                                    <p className="agency-label">{activeRoom.agency.name}</p>
                                  )}
                                  <div className="msg-bubble">
                                    {msg.text && <span>{msg.text}</span>}
                                    {msg.attachment?.url && (
                                      <a
                                        href={msg.attachment.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: 6,
                                          marginTop: msg.text ? 8 : 0,
                                          color: 'inherit', textDecoration: 'none',
                                          background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                                          padding: '6px 10px', fontSize: 12,
                                        }}
                                      >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48"/>
                                        </svg>
                                        {msg.attachment.original_name}
                                      </a>
                                    )}
                                    <span className="msg-time">{fmtTime(msg.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {messages.length === 0 && (
                        <div className="center-state">
                          <div className="center-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                          </div>
                          <p>No messages yet</p>
                          <span>Send the first message to get the conversation started.</span>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div className="input-bar">
                  {pendingFile && (
                    <div style={{
                      position: 'absolute', bottom: '80px', left: '18px', right: '18px',
                      background: 'var(--white)', border: '1px solid var(--blue-mid)',
                      borderRadius: '10px', padding: '10px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '12.5px', color: 'var(--text)', boxShadow: '0 2px 8px rgba(22,105,169,.08)',
                    }}>
                      <span>📎 {pendingFile.name}</span>
                      <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1 }}>×</button>
                    </div>
                  )}
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }} title="Attach file">
                    <input type="file" style={{ display: 'none' }} onChange={e => setPendingFile(e.target.files[0] || null)} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </label>
                  <div className="input-wrap">
                    <textarea
                      ref={inputRef}
                      className="chat-input"
                      placeholder="Type a message…"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      rows={1}
                    />
                    <button
                      className="send-btn"
                      onClick={handleSend}
                      disabled={(!input.trim() && !pendingFile) || sending}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}