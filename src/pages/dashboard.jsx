import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClaims, getMe } from '../api/auth';
import TermsModal from '../components/termsmodal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [claims, setClaims]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true); // true by default prevents flash
  const [currentUser, setCurrentUser]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // Check terms status — only show modal if terms_accept is false
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
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const statusMeta = (status) => {
    switch (status) {
      case 'submitted':   return { label: 'Submitted',   cls: 'status-submitted' };
      case 'assigned':    return { label: 'Assigned',    cls: 'status-assigned' };
      case 'in_progress': return { label: 'In Progress', cls: 'status-progress' };
      case 'closed':      return { label: 'Closed',      cls: 'status-closed' };
      default:            return { label: status,        cls: 'status-default' };
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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:   #0f1f3d;
          --navy-2: #162847;
          --navy-3: #1e3259;
          --gold:   #c9a84c;
          --gold-l: #e2c97e;
          --gold-d: #a8883a;
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --white:  #ffffff;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--navy);
        }

        /* ── NAVBAR ── */
        .navbar {
          background: var(--navy);
          border-bottom: 1px solid rgba(201,168,76,0.15);
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .logo-mark {
          width: 32px; height: 32px;
          border: 1.5px solid var(--gold);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 16px;
          color: #fff;
          letter-spacing: 0.01em;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .btn-submit-nav {
          background: var(--gold);
          color: var(--navy);
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .btn-submit-nav:hover {
          background: var(--gold-l);
          transform: translateY(-1px);
        }

        .btn-logout {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-logout:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        /* ── PAGE WRAP ── */
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── PAGE HEADER ── */
        .page-header {
          margin-bottom: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .page-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold-d);
          margin-bottom: 6px;
        }
        .page-title {
          font-family: 'Instrument Serif', serif;
          font-size: 36px;
          color: var(--navy);
          line-height: 1.1;
        }
        .page-title em { color: var(--gold); font-style: italic; }
        .page-sub {
          font-size: 13.5px;
          color: var(--muted);
          font-weight: 400;
          margin-top: 6px;
        }
        .header-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 40px;
          margin: 12px 0 8px;
        }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: var(--navy);
          border-radius: 16px;
          padding: 22px 24px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(201,168,76,0.1);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .stat-value {
          font-family: 'Instrument Serif', serif;
          font-size: 38px;
          line-height: 1;
          position: relative;
          z-index: 1;
        }
        .val-white  { color: #fff; }
        .val-gold   { color: var(--gold-l); }
        .val-purple { color: #b39ddb; }
        .val-green  { color: #80cbc4; }

        .stat-icon {
          position: absolute;
          top: 18px; right: 20px;
          opacity: 0.12;
          z-index: 1;
        }

        /* ── CLAIMS TABLE PANEL ── */
        .panel {
          background: var(--white);
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 20px rgba(15,31,61,0.05);
        }

        .panel-header {
          padding: 20px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--navy);
          position: relative;
          overflow: hidden;
        }
        .panel-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .panel-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: #fff;
          position: relative;
          z-index: 1;
        }
        .panel-count {
          font-size: 11.5px;
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 3px 12px;
          position: relative;
          z-index: 1;
        }

        .empty-state {
          padding: 72px 24px;
          text-align: center;
        }
        .empty-icon {
          width: 52px; height: 52px;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: var(--muted);
        }
        .empty-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .empty-sub {
          font-size: 13.5px;
          color: var(--muted);
          margin-bottom: 24px;
        }
        .btn-cta {
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-cta:hover {
          background: var(--navy-2);
          transform: translateY(-1px);
        }

        .table-wrap { overflow-x: auto; }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        thead tr {
          background: var(--cream);
          border-bottom: 1px solid var(--border);
        }
        thead th {
          padding: 12px 24px;
          text-align: left;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }
        tbody tr {
          border-bottom: 1px solid #f3f1ed;
          transition: background 0.12s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #faf8f4; }

        td { padding: 16px 24px; }

        .debtor-name {
          font-weight: 600;
          color: var(--navy);
          margin-bottom: 2px;
        }
        .debtor-type {
          font-size: 11.5px;
          color: var(--muted);
          text-transform: capitalize;
        }
        .amount {
          font-family: 'Instrument Serif', serif;
          font-size: 16px;
          color: var(--navy);
        }
        .date-text { color: var(--muted); font-size: 13px; }

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
        .status-submitted  { background: #fef9e7; color: #9a7d0a; border: 1px solid #f9e79f; }
        .status-submitted .status-dot { background: #f4d03f; }
        .status-assigned   { background: #eaf2ff; color: #1a5276; border: 1px solid #aed6f1; }
        .status-assigned .status-dot { background: #3498db; }
        .status-progress   { background: #f4ecf7; color: #6c3483; border: 1px solid #d7bde2; }
        .status-progress .status-dot { background: #9b59b6; }
        .status-closed     { background: #eafaf1; color: #1e8449; border: 1px solid #a9dfbf; }
        .status-closed .status-dot { background: #27ae60; }
        .status-default    { background: #f2f3f4; color: var(--muted); border: 1px solid var(--border); }
        .status-default .status-dot { background: var(--muted); }

        .view-link {
          color: var(--gold-d);
          font-weight: 600;
          font-size: 12.5px;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.25);
          padding: 5px 12px;
          border-radius: 7px;
          transition: background 0.14s, color 0.14s;
          white-space: nowrap;
        }
        .view-link:hover {
          background: var(--navy);
          color: var(--gold-l);
          border-color: transparent;
        }

        .skeleton-row td { padding: 16px 24px; }
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .footer-note {
          text-align: center;
          margin-top: 40px;
          font-size: 11.5px;
          color: #bbb;
          line-height: 1.6;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 600px) {
          .page { padding: 32px 16px 60px; }
          .navbar { padding: 0 16px; }
          .page-title { font-size: 28px; }
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* ── TERMS MODAL — only renders if terms_accept is false ── */}
      <TermsModal
        isOpen={!termsAccepted}
        onClose={null}
        onAccepted={() => setTermsAccepted(true)}
        userName={currentUser?.contact_name}
      />

      {/* ── NAVBAR ── */}
      <nav className="navbar">
       
        <div className="nav-actions">
          <Link
            to="/claims"
            className="inline-flex items-center gap-1.5 text-white/70 border border-white/10 hover:text-white hover:border-white/30 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 no-underline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            My Claims
          </Link>

          <Link
            to="/agencies"
            className="inline-flex items-center gap-1.5 text-white/70 border border-white/10 hover:text-white hover:border-white/30 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 no-underline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Agencies
          </Link>


          <Link
  to="/business-plans"
  className="inline-flex items-center gap-1.5 text-white/70 border border-white/10 hover:text-white hover:border-white/30 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 no-underline"
>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
  Plans
</Link>


          <Link
  to="/chat"
  className="inline-flex items-center gap-1.5 text-white/70 border border-white/10 hover:text-white hover:border-white/30 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 no-underline"
>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
  Messages
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
          <div>
            <p className="page-eyebrow">Overview</p>
            <h1 className="page-title">Your <em>Dashboard</em></h1>
            <div className="header-divider" />
            <p className="page-sub">Track and manage your entire recovery pipeline.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Claims</div>
            <div className="stat-value val-white">{stats.total}</div>
            <div className="stat-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Submitted</div>
            <div className="stat-value val-gold">{stats.submitted}</div>
            <div className="stat-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#e2c97e" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value val-purple">{stats.in_progress}</div>
            <div className="stat-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b39ddb" strokeWidth="1.2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Closed</div>
            <div className="stat-value val-green">{stats.closed}</div>
            <div className="stat-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#80cbc4" strokeWidth="1.2">
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
                      <td><div className="skel" style={{height:28,width:52,borderRadius:7}}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : claims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
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
                          <Link to={`/claims/${claim._id}`} className="view-link">View →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="footer-note">
        Pasado is a technology platform that connects businesses with
          independent, licensed collection agencies. We do not provide debt collection
          services, legal advice, or contact debtors on your behalf.
        </p>

      </div>
    </>
  );
}