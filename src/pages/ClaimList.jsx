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
    submitted:            { label: 'Submitted',           cls: 'status-submitted'  },
    assigned:             { label: 'Assigned',            cls: 'status-assigned'   },
    in_progress:          { label: 'In Progress',         cls: 'status-progress'   },
    closed:               { label: 'Closed',              cls: 'status-closed'     },
    pending:              { label: 'Pending',             cls: 'status-submitted'},
    connection_approved:  { label: 'Connection Approved', cls: 'status-conn-approved' }, // add
    connection_denied:    { label: 'Connection Denied',   cls: 'status-conn-denied'   }, // add
  };



  const filters = ['all', 'submitted', 'assigned', 'in_progress', 'closed'];

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--off-white); color: var(--text); }

        /* NAVBAR */
        .navbar {
          background: var(--blue);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding: 0 40px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }
        .navbar::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
        .logo-mark {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .nav-actions { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .back-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.65);
          text-decoration: none; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); }
        .btn-primary {
          background: rgba(255,255,255,0.15); color: #fff;
          border: 1px solid rgba(255,255,255,0.35); border-radius: 8px; padding: 8px 16px;
          font-size: 13px; font-family: inherit; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-primary:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.55); }

        /* PAGE */
        .page { max-width: 1000px; margin: 0 auto; padding: 48px 32px 80px; animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width:600px) { .page { padding: 32px 16px 60px; } .navbar { padding: 0 16px; } }

        /* HEADER */
        .page-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-bottom: 6px; }
        .page-title { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 4px; }
        .header-rule { width: 48px; height: 3px; background: var(--blue); border-radius: 2px; margin: 14px 0 10px; }
        .page-sub { font-size: 13.5px; color: var(--text-muted); margin-bottom: 28px; }

        /* FILTER TABS */
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn {
          padding: 6px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 600;
          border: 1px solid var(--border); background: var(--white); color: var(--text-muted);
          cursor: pointer; transition: all 0.15s; text-transform: capitalize;
          font-family: inherit;
        }
        .filter-btn:hover { border-color: var(--blue); color: var(--text); }
        .filter-btn-active { background: var(--blue); color: #fff; border-color: var(--blue); }

        /* PANEL */
        .panel { background: var(--white); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
        .panel-header {
          padding: 14px 24px; background: var(--blue);
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .panel-header::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px; pointer-events: none;
        }
        .panel-title { font-size: 14px; font-weight: 600; color: #fff; position: relative; z-index: 1; letter-spacing: 0.01em; }
        .panel-count {
          font-size: 11.5px; color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px; padding: 3px 12px; position: relative; z-index: 1;
        }

        /* TABLE */
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        thead tr { background: var(--off-white); border-bottom: 1px solid var(--border); }
        thead th {
          padding: 12px 24px; text-align: left;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--text-muted); white-space: nowrap;
        }
        tbody tr { border-bottom: 1px solid var(--border); transition: background 0.12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--blue-light); }
        td { padding: 16px 24px; }

        .debtor-name { font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .debtor-type { font-size: 11.5px; color: var(--text-muted); text-transform: capitalize; }
        .amount { font-size: 15px; font-weight: 600; color: var(--text); }
        .date-text { color: var(--text-muted); font-size: 13px; }

        /* STATUS */
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .status-submitted  { background: #fef9e7; color: #9a7d0a; border: 1px solid #f9e79f; }
        .status-submitted .status-dot  { background: #f4d03f; }
        .status-assigned   { background: var(--blue-light); color: #0f5189; border: 1px solid var(--blue-mid); }
        .status-assigned .status-dot   { background: var(--blue); }
        .status-progress   { background: #f4ecf7; color: #6c3483; border: 1px solid #d7bde2; }
        .status-progress .status-dot   { background: #9b59b6; }
        .status-closed     { background: #eafaf1; color: #1e8449; border: 1px solid #a9dfbf; }
        .status-closed .status-dot     { background: #27ae60; }

        .status-conn-approved { background: #eafaf1; color: #1e8449; border: 1px solid #a9dfbf; }
.status-conn-approved .status-dot { background: #27ae60; }
.status-conn-denied   { background: #fdf0ef; color: #c0392b; border: 1px solid #f1c0bc; }
.status-conn-denied   .status-dot { background: #c0392b; }
        .view-link {
          color: var(--blue); font-weight: 600; font-size: 12.5px;
          text-decoration: none; border: 1px solid var(--blue-mid);
          padding: 5px 12px; border-radius: 7px;
          transition: background 0.14s, color 0.14s, border-color 0.14s;
          white-space: nowrap;
        }
        .view-link:hover { background: var(--blue); color: #fff; border-color: var(--blue); }

        .assign-link {
          color: var(--text-muted); font-weight: 600; font-size: 12px;
          text-decoration: none; border: 1px solid var(--border);
          padding: 5px 10px; border-radius: 7px; transition: all 0.14s;
          white-space: nowrap; margin-left: 6px;
        }
        .assign-link:hover { background: var(--blue); color: #fff; border-color: var(--blue); }

        /* EMPTY */
        .empty-state { padding: 72px 24px; text-align: center; }
        .empty-icon {
          width: 52px; height: 52px; border: 1px solid var(--border);
          border-radius: 12px; display: inline-flex; align-items: center;
          justify-content: center; margin-bottom: 18px; color: var(--text-muted);
          background: var(--off-white);
        }
        .empty-title { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .empty-sub { font-size: 13.5px; color: var(--text-muted); margin-bottom: 24px; }
        .btn-cta {
          background: var(--blue); color: #fff; border: none; border-radius: 8px;
          padding: 11px 22px; font-size: 13.5px; font-family: inherit;
          font-weight: 600; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: background 0.15s;
        }
        .btn-cta:hover { background: var(--blue-dark); }

        /* SKELETON */
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--off-white) 25%, var(--border) 50%, var(--off-white) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .footer-note { text-align: center; margin-top: 40px; font-size: 11.5px; color: var(--text-muted); line-height: 1.6; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-actions">
         
         
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
        <h1 className="page-title">My Claims</h1>
        <div className="header-rule" />
        <p className="page-sub">Track and manage all your submitted claims.</p>

        {/* FILTER TABS */}
        <div className="filter-bar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'filter-btn-active' : ''}`}
            >
              {f === 'all'
                ? `All (${claims.length})`
                : `${f.replace('_', ' ')} (${claims.filter(c => c.status === f).length})`}
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
                      <td><div className="skel" style={{height:15,width:80}}/></td>
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
                {filter === 'all' ? 'No claims yet' : `No ${filter.replace('_', ' ')} claims`}
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
          Collection Connector is a technology platform that connects businesses with
          independent, licensed collection agencies. We do not provide debt collection
          services, legal advice, or contact debtors on your behalf.
        </p>
      </div>
    </>
  );
}