import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL, getClaims, getMe } from '../api/auth';
import TermsModal from '../components/termsmodal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [claims, setClaims]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [currentUser, setCurrentUser]   = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    

    getMe().then(({ user }) => {
      if (!user) return;
      setCurrentUser(user);
      setTermsAccepted(user.terms_accept);
    });

    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    const res = await getClaims();
    setLoading(false);
    if (res.claims) setClaims(res.claims);
   try{
    const countRes = await fetch(`${BASE_URL}/chat/unread-count`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const countData = await countRes.json();
    console.log("COUNTDATA")
    console.log(countData)
setUnreadCount(countData.unread || 0);
   }catch(e){
console.log(e.message)
   }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const statusMeta = (status) => {
    switch (status) {
      case 'submitted':           return { label: 'Submitted',           cls: 'status-submitted' };
      case 'assigned':            return { label: 'Assigned',            cls: 'status-assigned' };
      case 'in_progress':         return { label: 'In Progress',         cls: 'status-progress' };
      case 'closed':              return { label: 'Closed',              cls: 'status-closed' };
      case 'denied':              return { label: 'Denied',              cls: 'status-default' };
      case 'connection_approved': return { label: 'Connection Approved', cls: 'status-assigned' };
      case 'connection_denied':   return { label: 'Connection Denied',   cls: 'status-default' };
      default:                    return { label: status,                cls: 'status-default' };
    }
  };
  
  const stats = {
    total:       claims.length,
    submitted:   claims.filter(c => c.status === 'submitted').length,
    in_progress: claims.filter(c => c.status === 'in_progress').length,
    closed:      claims.filter(c => c.status === 'closed').length,
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue:      #1669A9;
          --blue-dark: #0f5189;
          --blue-light:#e8f2fa;
          --blue-mid:  #c5ddf0;
          --white:     #ffffff;
          --off-white: #f5f7fa;
          --border:    #e0e7ef;
          --text:      #1a2a3a;
          --text-mid:  #4a6070;
          --text-muted:#7a96a8;
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

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-mark {
          width: 34px; height: 34px;
          background: var(--blue);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--blue);
          letter-spacing: -0.01em;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-mid);
          text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .nav-link:hover {
          background: var(--blue-light);
          color: var(--blue);
          border-color: var(--blue-mid);
        }

        .btn-submit-nav {
          background: var(--blue);
          color: var(--white);
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
          margin-left: 4px;
        }
        .btn-submit-nav:hover {
          background: var(--blue-dark);
          transform: translateY(-1px);
        }

        .btn-logout {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-family: inherit;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .btn-logout:hover {
          color: var(--text);
          border-color: var(--text-muted);
          background: var(--off-white);
        }

        /* ── PAGE WRAP ── */
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── PAGE HEADER ── */
        .page-header {
          margin-bottom: 36px;
        }
        .page-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 8px;
        }
        .page-title {
          font-size: 34px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 8px;
        }
        .page-title span { color: var(--blue); }
        .header-rule {
          width: 48px;
          height: 3px;
          background: var(--blue);
          border-radius: 2px;
          margin: 14px 0 8px;
        }
        .page-sub {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 400;
        }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 36px;
        }
        @media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: var(--white);
          border-radius: 12px;
          padding: 22px 24px;
          border: 1px solid var(--border);
          border-top: 3px solid var(--blue);
          position: relative;
          overflow: hidden;
        }
        .stat-card.accent-total  { border-top-color: var(--blue); }
        .stat-card.accent-submit { border-top-color: #f59e0b; }
        .stat-card.accent-prog   { border-top-color: #8b5cf6; }
        .stat-card.accent-closed { border-top-color: #10b981; }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .stat-value {
          font-size: 40px;
          font-weight: 700;
          line-height: 1;
          color: var(--text);
        }
        .stat-icon {
          position: absolute;
          top: 16px; right: 18px;
          opacity: 0.08;
          color: var(--blue);
        }

        /* ── PANEL ── */
        .panel {
          background: var(--white);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .panel-header {
          padding: 18px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--blue);
        }
        .panel-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.01em;
        }
        .panel-count {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 3px 12px;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          padding: 72px 24px;
          text-align: center;
        }
        .empty-icon {
          width: 56px; height: 56px;
          background: var(--blue-light);
          border: 1px solid var(--blue-mid);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: var(--blue);
        }
        .empty-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .empty-sub {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .btn-cta {
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px 22px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-cta:hover {
          background: var(--blue-dark);
          transform: translateY(-1px);
        }

        /* ── TABLE ── */
        .table-wrap { overflow-x: auto; }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        thead tr {
          background: var(--off-white);
          border-bottom: 1px solid var(--border);
        }
        thead th {
          padding: 12px 24px;
          text-align: left;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }
        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.1s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--blue-light); }

        td { padding: 16px 24px; vertical-align: middle; }

        .debtor-name {
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }
        .debtor-type {
          font-size: 11.5px;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .amount {
          font-size: 15px;
          font-weight: 700;
          color: var(--blue);
        }
        .date-text { color: var(--text-muted); font-size: 13px; }

        /* ── STATUS BADGES ── */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .status-submitted  { background: #fffbeb; color: #92400e; border: 1px solid #fcd34d; }
        .status-submitted .status-dot { background: #f59e0b; }
        .status-assigned   { background: var(--blue-light); color: #0f5189; border: 1px solid var(--blue-mid); }
        .status-assigned .status-dot { background: var(--blue); }
        .status-progress   { background: #f5f3ff; color: #5b21b6; border: 1px solid #ddd6fe; }
        .status-progress .status-dot { background: #8b5cf6; }
        .status-closed     { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .status-closed .status-dot { background: #10b981; }
        .status-default    { background: var(--off-white); color: var(--text-muted); border: 1px solid var(--border); }
        .status-default .status-dot { background: var(--text-muted); }

        /* ── ACTION LINKS ── */
        .view-link {
          color: var(--blue);
          font-weight: 600;
          font-size: 12.5px;
          text-decoration: none;
          border: 1px solid var(--blue-mid);
          padding: 5px 12px;
          border-radius: 6px;
          background: var(--blue-light);
          transition: background 0.14s, color 0.14s, border-color 0.14s;
          white-space: nowrap;
        }
        .view-link:hover {
          background: var(--blue);
          color: #fff;
          border-color: var(--blue);
        }
        .edit-link {
          color: var(--text-mid);
          font-weight: 600;
          font-size: 12.5px;
          text-decoration: none;
          border: 1px solid var(--border);
          padding: 5px 12px;
          border-radius: 6px;
          background: var(--white);
          transition: background 0.14s, color 0.14s, border-color 0.14s;
          white-space: nowrap;
        }
        .edit-link:hover {
          background: var(--off-white);
          border-color: var(--text-muted);
          color: var(--text);
        }

        /* ── SKELETON ── */
        .skeleton-row td { padding: 16px 24px; }
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, #edf0f4 25%, #e2e6eb 50%, #edf0f4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── LEGAL FOOTER ── */
        .legal-note {
          text-align: center;
          margin-top: 40px;
          padding: 20px 24px;
          background: var(--white);
          border: 1px solid var(--border);
          border-left: 3px solid var(--blue);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .legal-note strong { color: var(--blue); font-weight: 600; }

        @media (max-width: 600px) {
          .page { padding: 32px 16px 60px; }
          .navbar { padding: 0 16px; }
          .page-title { font-size: 26px; }
        }
      `}</style>

      <TermsModal
        isOpen={!termsAccepted}
        onClose={null}
        onAccepted={() => setTermsAccepted(true)}
        userName={currentUser?.contact_name}
      />

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-brand">
        
        
        </div>

        <div className="nav-actions">
          <Link to="/claims" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            My Claims
          </Link>

          <Link to="/agencies" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Agencies
          </Link>

          <Link to="/account" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
           Account
          </Link>

          <Link to="/business-plans" className="nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Plans
          </Link>

          <Link to="/chat" className="nav-link">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
  Messages
  
    <span style={{
      background: '#c0392b', color: '#fff',
      fontSize: 10, fontWeight: 700,
      borderRadius: '99px', padding: '1px 6px',
      marginLeft: 4, lineHeight: '16px',
    }}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
 
</Link>

          <Link to="/claims/create" className="btn-submit-nav">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Submit Claim
          </Link>

          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div className="page">

        <div className="page-header">
          <p className="page-eyebrow">Overview</p>
          <h1 className="page-title">Recovery <span>Dashboard</span></h1>
          <div className="header-rule" />
          <p className="page-sub">Track and manage your entire recovery pipeline.</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card accent-total">
            <div className="stat-label">Total Claims</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="1.2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-submit">
            <div className="stat-label">Submitted</div>
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-prog">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.in_progress}</div>
            <div className="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </div>
          </div>

          <div className="stat-card accent-closed">
            <div className="stat-label">Closed</div>
            <div className="stat-value">{stats.closed}</div>
            <div className="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Claims Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Your Claims</h2>
            <span className="panel-count">{claims.length} total</span>
          </div>

          {loading ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Debtor</th><th>Amount</th><th>Due Date</th>
                    <th>Status</th><th>Submitted</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(4)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td><div className="skel" style={{height:13,width:120,marginBottom:6}}/><div className="skel" style={{height:10,width:70}}/></td>
                      <td><div className="skel" style={{height:16,width:80}}/></td>
                      <td><div className="skel" style={{height:13,width:90}}/></td>
                      <td><div className="skel" style={{height:22,width:90,borderRadius:20}}/></td>
                      <td><div className="skel" style={{height:13,width:80}}/></td>
                      <td><div className="skel" style={{height:28,width:52,borderRadius:6}}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : claims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 className="empty-title">No claims yet</h3>
              <p className="empty-sub">Submit your first claim to start tracking your recovery pipeline.</p>
              <Link to="/claims/create" className="btn-cta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Submit Your First Claim
              </Link>
            </div>

          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Debtor</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => {
                    const { label, cls } = statusMeta(claim.status);
                    return (
                      <tr key={claim._id}>
                        <td>
                          <div className="debtor-name">{claim.debtor_name}</div>
                          <div className="debtor-type">{claim.debtor_type}</div>
                        </td>
                        <td>
                          <span className="amount">${claim.amount?.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="date-text">
                            {claim.due_date ? new Date(claim.due_date).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${cls}`}>
                            <span className="status-dot" />
                            {label}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/claims/${claim._id}`} className="view-link">View →</Link>
                            <Link to={`/edit-claim/${claim._id}`} className="edit-link">Edit</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legal note matching site's disclaimer style */}
        <div className="legal-note">
          <strong>Platform notice:</strong> Collection Connector is a technology platform that connects businesses with
          independent, licensed collection agencies. We do not provide debt collection
          services, legal advice, or contact debtors on your behalf.
        </div>

      </div>
    </>
  );
}