import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAgencyMe, getAgencyAssignments, updateAssignmentStatus } from '../api/auth';

const PLAN_META = {
  starter:      { color: '#1669A9', bg: '#e8f2fa' },
  growth:       { color: '#1669A9', bg: '#c5ddf0' },
  professional: { color: '#0f5189', bg: '#e8f2fa' },
  enterprise:   { color: '#0f5189', bg: '#c5ddf0' },
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const [agency, setAgency]           = useState(null);
  const [user, setUser]               = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeTab, setActiveTab]     = useState('all');
  const [updating, setUpdating]       = useState(null);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    if (!localStorage.getItem('agencyToken')) { navigate('/agency/login'); return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [meRes, assignRes] = await Promise.all([getAgencyMe(), getAgencyAssignments()]);
      if (meRes.error || !meRes.agency) { navigate('/agency/login'); return; }
  
      setAgency(meRes.agency);
      setUser(meRes.user);
      setAssignments(assignRes.assignments || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard. Please refresh.');
    }
    setLoading(false);
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdating(assignmentId);
    const res = await updateAssignmentStatus({ assignment_id: assignmentId, status: newStatus });
    if (res.assignment) setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, status: newStatus } : a));
    setUpdating(null);
  };

  const handleLogout = () => { localStorage.removeItem('agencyToken'); navigate('/agency/login'); };

  const filtered = assignments.filter(a => {
    const matchTab = activeTab === 'all' || a.claim_id.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (a.claim_id?.debtor_name || '').toLowerCase().includes(q)
      || (a.claim_id?.debtor_email || '').toLowerCase().includes(q)
      || String(a.claim_id?.amount || '').includes(q);
    return matchTab && matchSearch;
  });

  const stats = {
    total:                assignments.length,
    in_progress:          assignments.filter(a => a.claim_id.status === 'in_progress').length,
    closed:               assignments.filter(a => a.claim_id.status === 'closed').length,
    denied:               assignments.filter(a => a.claim_id.status === 'denied').length,
    connection_approved:  assignments.filter(a => a.claim_id.status === 'connection_approved').length,
    connection_denied:    assignments.filter(a => a.claim_id.status === 'connection_denied').length,
    totalValue:           assignments.reduce((s, a) => s + (a.claim_id?.amount || 0), 0),
  };

  const planUsedPct = agency
    ? Math.min(100, Math.round(((agency.claims_used || 0) / (agency.claim_limit || 1)) * 100))
    : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f5f7fa', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: '#7a96a8', fontSize: 14 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e0e7ef', borderTopColor: '#1669A9', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <p>Loading your dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const fmtStatus = (s) =>
    s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—';

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
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--off-white);
          color: var(--text);
        }

        /* ── NAVBAR ── */
        .navbar {
          background: var(--white);
          border-bottom: 2px solid var(--blue);
          padding: 0 40px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(22,105,169,0.08);
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; }
        .logo-mark {
          width: 34px; height: 34px;
          background: var(--blue);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text { font-size: 20px; font-weight: 700; color: var(--blue); letter-spacing: -0.01em; }

        .nav-actions { display: flex; align-items: center; gap: 8px; }

        .nav-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 6px;
          font-size: 13.5px; font-weight: 500;
          color: var(--text-mid); text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .nav-link:hover { background: var(--blue-light); color: var(--blue); border-color: var(--blue-mid); }

        .btn-logout {
          background: transparent; border: 1px solid var(--border);
          border-radius: 6px; padding: 7px 14px;
          font-size: 13px; font-family: inherit;
          color: var(--text-muted); cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .btn-logout:hover { color: var(--text); border-color: var(--text-muted); background: var(--off-white); }

        /* ── PAGE ── */
        .page {
          max-width: 1200px; margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        /* ── PAGE HEADER ── */
        .page-header { margin-bottom: 36px; }
        .page-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--blue); margin-bottom: 8px;
        }
        .page-title { font-size: 34px; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 8px; }
        .page-title span { color: var(--blue); }
        .header-rule { width: 48px; height: 3px; background: var(--blue); border-radius: 2px; margin: 14px 0 8px; }
        .page-sub { font-size: 14px; color: var(--text-muted); }

        .quick-links { display: flex; gap: 18px; margin-top: 14px; flex-wrap: wrap; }
        .quick-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12.5px; font-weight: 500; color: var(--blue);
          text-decoration: none; transition: color 0.15s;
        }
        .quick-link:hover { color: var(--blue-dark); }

        /* ── ERROR ── */
        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc;
          color: #c0392b; font-size: 13px;
          padding: 10px 14px; border-radius: 8px; margin-bottom: 20px;
        }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 36px;
        }
        @media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: var(--white); border-radius: 12px;
          padding: 22px 24px; border: 1px solid var(--border);
          border-top: 3px solid var(--blue); position: relative; overflow: hidden;
        }
        .stat-card.accent-total  { border-top-color: var(--blue); }
        .stat-card.accent-prog   { border-top-color: #8b5cf6; }
        .stat-card.accent-closed { border-top-color: #10b981; }
        .stat-card.accent-value  { border-top-color: #f59e0b; }

        .stat-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;
        }
        .stat-value { font-size: 36px; font-weight: 700; line-height: 1; color: var(--text); }
        .stat-value.accent { color: var(--blue); font-size: 28px; }
        .stat-sub { font-size: 11.5px; color: var(--text-muted); margin-top: 4px; }
        .stat-icon { position: absolute; top: 16px; right: 18px; opacity: 0.07; }

        /* ── LAYOUT GRID ── */
        .dash-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        @media (max-width: 1100px) { .dash-grid { grid-template-columns: 1fr; } }

        /* ── PANEL ── */
        .panel { background: var(--white); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }

        .panel-header {
          padding: 18px 24px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; background: var(--blue);
        }
        .panel-title { font-size: 16px; font-weight: 700; color: var(--white); }
        .panel-count {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px; padding: 3px 12px;
        }

        .search-wrap { position: relative; }
        .search-wrap input {
          border: 1.5px solid rgba(255,255,255,0.3); border-radius: 7px;
          padding: 7px 12px 7px 32px; font-size: 13px;
          font-family: inherit; color: var(--white);
          background: rgba(255,255,255,0.12); outline: none; width: 200px;
          transition: border-color 0.18s, background 0.18s;
        }
        .search-wrap input::placeholder { color: rgba(255,255,255,0.5); }
        .search-wrap input:focus { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.2); }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.5); pointer-events: none; }

        /* ── TABS ── */
        .tabs {
          display: flex; gap: 2px; padding: 0 24px;
          border-bottom: 1px solid var(--border); overflow-x: auto;
          background: var(--white);
        }
        .tab {
          font-size: 13px; font-weight: 500; padding: 12px 14px 14px;
          color: var(--text-muted); cursor: pointer;
          border: none; border-bottom: 2px solid transparent;
          background: none; font-family: inherit; white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab:hover { color: var(--text); }
        .tab.active { color: var(--blue); border-bottom-color: var(--blue); font-weight: 600; }
        .tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; border-radius: 99px;
          font-size: 10px; font-weight: 700;
          background: var(--off-white); color: var(--text-muted);
          margin-left: 5px; padding: 0 4px;
        }
        .tab.active .tab-count { background: var(--blue); color: #fff; }

        /* ── TABLE ── */
        .table-wrap { overflow-x: auto; }
        .claim-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .claim-table thead tr { background: var(--off-white); border-bottom: 1px solid var(--border); }
        .claim-table th {
          padding: 12px 24px; text-align: left;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted); white-space: nowrap;
        }
        .claim-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; cursor: pointer; }
        .claim-table tbody tr:last-child { border-bottom: none; }
        .claim-table tbody tr:hover td { background: var(--blue-light); }
        .claim-table tbody tr.is-new td { background: #fffdf5; }
        .claim-table tbody tr.is-new:hover td { background: var(--blue-light); }
        .claim-table td { padding: 15px 24px; vertical-align: middle; }

        .debtor-name { font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .debtor-email { font-size: 11.5px; color: var(--text-muted); }
        .amount-cell { font-size: 15px; font-weight: 700; color: var(--blue); }
        .date-text { color: var(--text-muted); font-size: 13px; }

        /* ── STATUS BADGES ── */
        .new-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; padding: 2px 7px; border-radius: 20px;
          margin-left: 6px;
        }
        .badge-assigned  { background: var(--blue-light); border: 1px solid var(--blue-mid); color: var(--blue-dark); }
        .badge-progress  { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; }
        .badge-denied    { background: #fdf0ef; border: 1px solid #f1c0bc; color: #c0392b; }
        .badge-closed    { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }

        /* ── EMPTY STATE ── */
        .empty-state { padding: 64px 24px; text-align: center; }
        .empty-icon {
          width: 52px; height: 52px; background: var(--blue-light);
          border: 1px solid var(--blue-mid); border-radius: 12px;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 16px; color: var(--blue);
        }
        .empty-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .empty-sub { font-size: 13.5px; color: var(--text-muted); }

        /* ── SIDEBAR ── */
        .sidebar { display: flex; flex-direction: column; gap: 16px; }

        .side-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 12px; padding: 20px;
        }
        .side-card-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px;
        }

        .plan-badge {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 20px;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 14px;
          background: var(--blue-light); color: var(--blue-dark);
          border: 1px solid var(--blue-mid);
        }
        .plan-limits {
          display: flex; justify-content: space-between;
          font-size: 12px; color: var(--text-muted); margin-bottom: 8px;
        }
        .plan-limits strong { color: var(--text); font-weight: 600; }
        .progress-bar { height: 5px; border-radius: 99px; background: var(--border); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; background: var(--blue); transition: width 0.6s ease; }
        .progress-fill.warn   { background: #d97706; }
        .progress-fill.danger { background: #c0392b; }

        .upgrade-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12.5px; font-weight: 600; color: var(--blue);
          cursor: pointer; margin-top: 10px; text-decoration: none;
          transition: color 0.15s;
        }
        .upgrade-link:hover { color: var(--blue-dark); }

        .profile-row { display: flex; flex-direction: column; gap: 10px; }
        .profile-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .profile-item-label { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
        .profile-item-value { font-size: 12.5px; color: var(--text); font-weight: 500; text-align: right; word-break: break-all; }

        .verified-chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: #ecfdf5; color: #065f46;
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 20px;
          border: 1px solid #a7f3d0;
        }
        .unverified-chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: #fffbeb; color: #92400e;
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 20px;
          border: 1px solid #fcd34d;
        }

        .mini-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .mini-tag {
          font-size: 11px; padding: 2px 8px; border-radius: 20px;
          background: var(--off-white); border: 1px solid var(--border);
          color: var(--text-muted); font-weight: 500;
        }

        /* ── LEGAL ── */
        .legal-note {
          text-align: center; margin-top: 40px; padding: 20px 24px;
          background: var(--white); border: 1px solid var(--border);
          border-left: 3px solid var(--blue); border-radius: 8px;
          font-size: 12px; color: var(--text-muted); line-height: 1.7;
        }
        .legal-note strong { color: var(--blue); font-weight: 600; }

        @media (max-width: 600px) {
          .page { padding: 32px 16px 60px; }
          .navbar { padding: 0 16px; }
          .page-title { font-size: 26px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-brand">
          {/* logo slot */}
        </div>

        <div className="nav-actions">
          <Link to="/dashboard" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Business Portal
          </Link>

          <Link to="/agency/chat" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Messages
          </Link>

          <Link to="/agency/subscription" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Subscription
          </Link>

          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div className="page">

        {/* Header */}
        <div className="page-header">
          <p className="page-eyebrow">Agency Overview</p>
          <h1 className="page-title">{agency?.name || 'Agency'} <span>Dashboard</span></h1>
          <div className="header-rule" />
          <p className="page-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="quick-links">
            {[
              { label: 'Business portal', to: '/login' },
              { label: 'Agency register', to: '/agency/register' },
              { label: 'Subscription Plans', to: '/agency/subscription' },
              { label: 'Agency Chat', to: '/agency/chat' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="quick-link">
                {l.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {error && <div className="err-box">{error}</div>}

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card accent-total">
            <div className="stat-label">Total Assigned</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">all time</div>
            <div className="stat-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="1.2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-prog">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.in_progress}</div>
            <div className="stat-sub">active cases</div>
            <div className="stat-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-closed">
            <div className="stat-label">Closed</div>
            <div className="stat-value">{stats.closed}</div>
            <div className="stat-sub">completed</div>
            <div className="stat-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-value">
            <div className="stat-label">Total Claim Value</div>
            <div className="stat-value accent">{fmt(stats.totalValue)}</div>
            <div className="stat-sub">across all claims</div>
            <div className="stat-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dash-grid">

          {/* Claims Panel */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Assigned Claims</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="panel-count">{assignments.length} total</span>
                <div className="search-wrap">
                  <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Search debtor, email…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="tabs">
              {[
              { key: 'all',                 label: 'All' },
              { key: 'assigned',            label: 'Assigned' },
              { key: 'in_progress',         label: 'In Progress' },
              { key: 'closed',              label: 'Closed' },
              { key: 'denied',              label: 'Denied' },
              { key: 'connection_approved', label: 'Conn. Approved' },
              { key: 'connection_denied',   label: 'Conn. Denied' },
              ].map(t => (
                <button key={t.key} className={`tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  <span className="tab-count">
                    {t.key === 'all' ? assignments.length : assignments.filter(a => a.claim_id.status === t.key).length}
                  </span>
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h3 className="empty-title">No claims found</h3>
                <p className="empty-sub">{search ? 'Try a different search term' : 'New assignments will appear here'}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="claim-table">
                  <thead>
                    <tr>
                      <th>Debtor</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Assigned On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => {
                      const claim = a.claim_id || {};
                      return (
                        <tr
                          key={a._id}
                          className={claim.status === 'assigned' ? 'is-new' : ''}
                          onClick={() => navigate(`/agency-claims/${claim._id}`)}
                        >
                          <td>
                            <div className="debtor-name">
                              {claim.debtor_name || '—'}
                              {claim.status === 'assigned' && (
                                <span className="new-badge badge-assigned">
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="#1669A9"><circle cx="12" cy="12" r="10"/></svg>
                                  New
                                </span>
                              )}
                              {claim.status === 'in_progress' && (
                                <span className="new-badge badge-progress">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                  In Progress
                                </span>
                              )}
                              {claim.status === 'denied' && (
                                <span className="new-badge badge-denied">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                  Denied
                                </span>
                              )}
                              {claim.status === 'closed' && (
                                <span className="new-badge badge-closed">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                  Closed
                                </span>
                              )}

{claim.status === 'connection_approved' && (
  <span className="new-badge" style={{ background: '#eaf4fb', border: '1px solid #c5ddf0', color: '#1669A9' }}>
    <svg width="7" height="7" viewBox="0 0 24 24" fill="#1669A9"><circle cx="12" cy="12" r="10"/></svg>
    Conn. Approved
  </span>
)}
{claim.status === 'connection_denied' && (
  <span className="new-badge badge-denied">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    Conn. Denied
  </span>
)}
                            </div>
                            <div className="debtor-email">{claim.debtor_email || ''}</div>
                          </td>
                          <td><span className="amount-cell">{fmt(claim.amount)}</span></td>
                          <td><span className="date-text">{fmtStatus(claim.status)}</span></td>
                          <td><span className="date-text">{fmtDate(claim.due_date)}</span></td>
                          <td><span className="date-text">{fmtDate(a.assigned_at)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {agency && (
              <div className="side-card">
                <p className="side-card-title">Plan & Usage</p>
                <div className="plan-badge">
                  {(agency.plan_type || 'starter').toUpperCase()}
                </div>
                <div className="plan-limits">
                  <span>Claims used</span>
                  <strong>{agency.claims_used || 0} / {agency.claim_limit || 25}</strong>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill${planUsedPct >= 90 ? ' danger' : planUsedPct >= 70 ? ' warn' : ''}`}
                    style={{ width: `${planUsedPct}%` }}
                  />
                </div>
                {agency.subscription_end_date && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 9 }}>
                    Renews {fmtDate(agency.subscription_end_date)}
                  </p>
                )}
                <span className="upgrade-link" onClick={() => navigate('/agency/subscription')}>
                  Upgrade plan
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
            )}

            {agency && (
              <div className="side-card">
                <p className="side-card-title">Agency Profile</p>
                <div className="profile-row">
                  <div className="profile-item">
                    <span className="profile-item-label">Status</span>
                    <span>
                      {agency.is_verified
                        ? <span className="verified-chip">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Verified
                          </span>
                        : <span className="unverified-chip">Pending</span>
                      }
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-item-label">Fee rate</span>
                    <span className="profile-item-value">{agency.fee_percentage || 0}%</span>
                  </div>
                  {agency.contact_email && (
                    <div className="profile-item">
                      <span className="profile-item-label">Email</span>
                      <span className="profile-item-value">{agency.contact_email}</span>
                    </div>
                  )}
                  {agency.contact_phone && (
                    <div className="profile-item">
                      <span className="profile-item-label">Phone</span>
                      <span className="profile-item-value">{agency.contact_phone}</span>
                    </div>
                  )}
                  {agency.specialties?.length > 0 && (
                    <div>
                      <span className="profile-item-label" style={{ display: 'block', marginBottom: 7 }}>Specialties</span>
                      <div className="mini-tags">
                        {agency.specialties.map(s => <span className="mini-tag" key={s}>{s}</span>)}
                      </div>
                    </div>
                  )}
                  {agency.states_covered?.length > 0 && (
                    <div>
                      <span className="profile-item-label" style={{ display: 'block', marginBottom: 7 }}>
                        States ({agency.states_covered.length})
                      </span>
                      <div className="mini-tags">
                        {agency.states_covered.slice(0, 10).map(s => <span className="mini-tag" key={s}>{s}</span>)}
                        {agency.states_covered.length > 10 && (
                          <span className="mini-tag">+{agency.states_covered.length - 10}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal note */}
        <div className="legal-note">
          <strong>Platform notice:</strong> Collection Connector is a technology platform that connects businesses with
          independent, licensed collection agencies. We do not provide debt collection
          services, legal advice, or contact debtors on your behalf.
        </div>

      </div>
    </>
  );
}