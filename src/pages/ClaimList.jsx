import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClaims } from '../api/auth';

export default function ClaimsList() {
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    (async () => {
      const res = await getClaims();
      setLoading(false);
      if (res.claims) setClaims(res.claims);
    })();
  }, []);

  const STATUS_META = {
    submitted:   { label: 'Submitted',   cls: 'status-submitted'  },
    assigned:    { label: 'Assigned',    cls: 'status-assigned'   },
    in_progress: { label: 'In Progress', cls: 'status-progress'   },
    closed:      { label: 'Closed',      cls: 'status-closed'     },
  };

  const filters = ['all', 'submitted', 'assigned', 'in_progress', 'closed'];

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --navy:#0f1f3d; --navy-2:#162847; --gold:#c9a84c; --gold-l:#e2c97e;
          --gold-d:#a8883a; --cream:#faf8f4; --muted:#8a95a3; --border:#e4e2dd; --white:#ffffff;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--navy); }

        /* NAVBAR */
        .navbar {
          background:var(--navy); border-bottom:1px solid rgba(201,168,76,0.15);
          padding:0 40px; height:64px;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:100;
        }
        .navbar::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .nav-brand { display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
        .logo-mark { width:32px; height:32px; border:1.5px solid var(--gold); border-radius:7px; display:flex; align-items:center; justify-content:center; }
        .logo-text { font-family:'Instrument Serif',serif; font-size:16px; color:#fff; }
        .nav-actions { display:flex; align-items:center; gap:12px; position:relative; z-index:1; }
        .back-link {
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.5);
          text-decoration:none; border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; padding:7px 14px; transition:color 0.15s,border-color 0.15s;
        }
        .back-link:hover { color:#fff; border-color:rgba(255,255,255,0.28); }
        .btn-gold {
          background:var(--gold); color:var(--navy);
          border:none; border-radius:8px; padding:8px 16px;
          font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600;
          cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:6px;
          transition:background 0.15s;
        }
        .btn-gold:hover { background:var(--gold-l); }

        /* PAGE */
        .page { max-width:1000px; margin:0 auto; padding:48px 32px 80px; animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:600px){ .page{padding:32px 16px 60px;} .navbar{padding:0 16px;} }

        /* HEADER */
        .page-eyebrow { font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold-d); margin-bottom:6px; }
        .page-title { font-family:'Instrument Serif',serif; font-size:34px; color:var(--navy); line-height:1.1; }
        .page-title em { color:var(--gold); font-style:italic; }
        .header-divider { height:1px; background:linear-gradient(90deg,var(--gold) 0%,transparent 100%); width:40px; margin:12px 0 16px; }

        /* FILTER TABS */
        .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
        .filter-btn {
          padding:6px 14px; border-radius:20px; font-size:12.5px; font-weight:600;
          border:1px solid var(--border); background:var(--white); color:var(--muted);
          cursor:pointer; transition:all 0.15s; text-transform:capitalize;
          font-family:'DM Sans',sans-serif;
        }
        .filter-btn:hover { border-color:var(--gold); color:var(--navy); }
        .filter-btn-active { background:var(--navy); color:#fff; border-color:var(--navy); }

        /* PANEL */
        .panel { background:var(--white); border-radius:20px; border:1px solid var(--border); overflow:hidden; box-shadow:0 2px 20px rgba(15,31,61,0.05); }
        .panel-header {
          padding:18px 28px; background:var(--navy);
          display:flex; align-items:center; justify-content:space-between;
          position:relative; overflow:hidden;
        }
        .panel-header::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);
          background-size:32px 32px; pointer-events:none;
        }
        .panel-title { font-family:'Instrument Serif',serif; font-size:18px; color:#fff; position:relative; z-index:1; }
        .panel-count {
          font-size:11.5px; color:rgba(255,255,255,0.35);
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.08);
          border-radius:20px; padding:3px 12px; position:relative; z-index:1;
        }

        /* TABLE */
        .table-wrap { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; font-size:13.5px; }
        thead tr { background:var(--cream); border-bottom:1px solid var(--border); }
        thead th {
          padding:12px 24px; text-align:left;
          font-size:10.5px; font-weight:600; letter-spacing:0.08em;
          text-transform:uppercase; color:var(--muted); white-space:nowrap;
        }
        tbody tr { border-bottom:1px solid #f3f1ed; transition:background 0.12s; }
        tbody tr:last-child { border-bottom:none; }
        tbody tr:hover { background:#faf8f4; }
        td { padding:16px 24px; }

        .debtor-name { font-weight:600; color:var(--navy); margin-bottom:2px; }
        .debtor-type { font-size:11.5px; color:var(--muted); text-transform:capitalize; }
        .amount { font-family:'Instrument Serif',serif; font-size:17px; color:var(--navy); }
        .date-text { color:var(--muted); font-size:13px; }

        /* STATUS */
        .status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:600; }
        .status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .status-submitted  { background:#fef9e7; color:#9a7d0a; border:1px solid #f9e79f; }
        .status-submitted .status-dot  { background:#f4d03f; }
        .status-assigned   { background:#eaf2ff; color:#1a5276; border:1px solid #aed6f1; }
        .status-assigned .status-dot   { background:#3498db; }
        .status-progress   { background:#f4ecf7; color:#6c3483; border:1px solid #d7bde2; }
        .status-progress .status-dot   { background:#9b59b6; }
        .status-closed     { background:#eafaf1; color:#1e8449; border:1px solid #a9dfbf; }
        .status-closed .status-dot     { background:#27ae60; }

        .view-link {
          color:var(--gold-d); font-weight:600; font-size:12.5px;
          text-decoration:none; border:1px solid rgba(201,168,76,0.25);
          padding:5px 12px; border-radius:7px; transition:background 0.14s,color 0.14s;
          white-space:nowrap;
        }
        .view-link:hover { background:var(--navy); color:var(--gold-l); border-color:transparent; }

        /* ASSIGN LINK */
        .assign-link {
          color:var(--muted); font-weight:600; font-size:12px;
          text-decoration:none; border:1px solid var(--border);
          padding:5px 10px; border-radius:7px; transition:all 0.14s;
          white-space:nowrap; margin-left:6px;
        }
        .assign-link:hover { background:var(--navy); color:#fff; border-color:transparent; }

        /* EMPTY */
        .empty-state { padding:72px 24px; text-align:center; }
        .empty-icon { width:52px; height:52px; border:1.5px solid var(--border); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:18px; color:var(--muted); }
        .empty-title { font-family:'Instrument Serif',serif; font-size:20px; color:var(--navy); margin-bottom:6px; }
        .empty-sub { font-size:13.5px; color:var(--muted); margin-bottom:24px; }
        .btn-cta {
          background:var(--navy); color:#fff; border:none; border-radius:10px;
          padding:11px 22px; font-size:13.5px; font-family:'DM Sans',sans-serif;
          font-weight:600; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:7px; transition:background 0.15s;
        }
        .btn-cta:hover { background:var(--navy-2); }

        /* SKELETON */
        .skel { border-radius:6px; background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
        @keyframes shimmer { to{background-position:-200% 0} }

        .footer-note { text-align:center; margin-top:40px; font-size:11.5px; color:#bbb; line-height:1.6; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" style={{width:16,height:16}}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="logo-text">Collections Connector</span>
        </div>
        <div className="nav-actions">
          <Link to="/agencies" className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Agencies
          </Link>
          <Link to="/claims/create" className="btn-gold">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Submit Claim
          </Link>
          <Link to="/dashboard" className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="page">

        {/* HEADER */}
        <p className="page-eyebrow">Claims</p>
        <h1 className="page-title">My <em>Claims</em></h1>
        <div className="header-divider" />

        {/* FILTER TABS */}
        <div className="filter-bar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'filter-btn-active' : ''}`}
            >
              {f === 'all' ? `All (${claims.length})` : `${f.replace('_', ' ')} (${claims.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>

        {/* PANEL */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              {filter === 'all' ? 'All Claims' : filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <span className="panel-count">{filtered.length} claims</span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Debtor</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Submitted</th><th></th></tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
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
          )}

          {/* EMPTY */}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 className="empty-title">
                {filter === 'all' ? 'No claims yet' : `No ${filter.replace('_',' ')} claims`}
              </h3>
              <p className="empty-sub">
                {filter === 'all'
                  ? 'Submit your first claim to start tracking your recovery pipeline.'
                  : 'No claims with this status found.'}
              </p>
              {filter === 'all' && (
                <Link to="/claims/create" className="btn-cta">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Submit Your First Claim
                </Link>
              )}
            </div>
          )}

          {/* TABLE */}
          {!loading && filtered.length > 0 && (
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
                  {filtered.map((claim) => {
                    const { label, cls } = STATUS_META[claim.status] || { label: claim.status, cls: '' };
                    return (
                      <tr key={claim._id}>
                        <td>
                          <div className="debtor-name">{claim.debtor_name}</div>
                          <div className="debtor-type">{claim.debtor_type}</div>
                        </td>
                        <td>
                          <span className="amount">${Number(claim.amount).toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="date-text">{formatDate(claim.due_date)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${cls}`}>
                            <span className="status-dot" />
                            {label}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">{formatDate(claim.createdAt)}</span>
                        </td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <Link to={`/claims/${claim._id}`} className="view-link">View →</Link>
                          {claim.status === 'submitted' && (
                            <Link to="/agencies" state={{ preselected_claim: claim._id }} className="assign-link">
                              Assign
                            </Link>
                          )}
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
          Collections Connector is a technology platform that connects businesses with
          independent, licensed collection agencies. We do not provide debt collection
          services, legal advice, or contact debtors on your behalf.
        </p>
      </div>
    </>
  );
}