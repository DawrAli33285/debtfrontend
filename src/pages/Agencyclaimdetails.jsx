import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgencyClaimById, getAgencyMe, acceptAgencyClaim, denyAgencyClaim, reopenAgencyClaim, closeAgencyClaim, BASE_URL } from '../api/auth';

const STATUS_META = {
  submitted:            { label: 'Submitted',            cls: 'status-submitted'          },
  assigned:             { label: 'Assigned',             cls: 'status-assigned'           },
  in_progress:          { label: 'In Progress',          cls: 'status-progress'           },
  closed:               { label: 'Closed',               cls: 'status-closed'             },
  denied:               { label: 'Denied',               cls: 'status-denied'             },
  connection_approved:  { label: 'Connection Approved',  cls: 'status-connection-approved'},
  connection_denied:    { label: 'Connection Denied',    cls: 'status-connection-denied'  },
};



function StatusBadge({ status }) {
  const { label, cls } = STATUS_META[status] || STATUS_META.submitted;
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div className="field-item">
      <p className="field-label">{label}</p>
      <p className="field-value">
        {value || <span className="field-empty">Not provided</span>}
      </p>
    </div>
  );
}

export default function AgencyClaimDetail() {
  const { id } = useParams();
  const [claim, setClaim]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const handleAccept = async () => {
    setActionLoading('accept'); setActionError('');
    const res = await acceptAgencyClaim(id);
    setActionLoading('');
    if (res.claim) setClaim(res.claim);
    else setActionError(res.message || 'Failed to accept claim');
  };

  const handleDeny = async () => {
    setActionLoading('deny'); setActionError('');
    const res = await denyAgencyClaim(id);
    setActionLoading('');
    if (res.claim) setClaim(res.claim);
    else setActionError(res.message || 'Failed to deny claim');
  };

  const handleReopen = async () => {
    setConfirmModal(null); setActionLoading('reopen'); setActionError('');
    const res = await reopenAgencyClaim(id);
    setActionLoading('');
    if (res.claim) setClaim(res.claim);
    else setActionError(res.message || 'Failed to reopen claim');
  };

  const handleClose = async () => {
    setConfirmModal(null); setActionLoading('close'); setActionError('');
    const res = await closeAgencyClaim(id);
    setActionLoading('');
    if (res.claim) setClaim(res.claim);
    else setActionError(res.message || 'Failed to close claim');
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [res, agencyRes] = await Promise.all([getAgencyClaimById(id), getAgencyMe()]);
      setLoading(false);
      if (agencyRes) setAgency(agencyRes.agency);
      if (res.claim) setClaim(res.claim);
      else setError(res.message || 'Failed to load claim');
    })();
  }, [id]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  const formatCurrency = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

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
          --success:    #1e8449;
        }

        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--off-white); color: var(--text); }

        /* ── NAVBAR ── */
        .navbar {
          background: var(--blue);
          border-bottom: 1px solid rgba(255,255,255,0.12);
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
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .nav-brand {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
          text-decoration: none;
        }
        .logo-mark {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 16px; color: #fff; letter-spacing: 0.01em;
        }
        .back-link {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.08); }

        /* ── PAGE ── */
        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .page { padding: 32px 16px 60px; }
          .navbar { padding: 0 16px; }
        }

        /* ── PAGE HEADER ── */
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .page-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--blue); margin-bottom: 6px;
        }
        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.15;
        }
        .header-rule {
          width: 48px; height: 3px;
          background: var(--blue);
          border-radius: 2px;
          margin: 14px 0 8px;
        }
        .claim-id {
          font-size: 11px; color: var(--text-muted);
          font-family: monospace; letter-spacing: 0.04em;
        }

        /* ── STATUS BADGE ── */
        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em;
          white-space: nowrap; flex-shrink: 0; margin-top: 6px;
        }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .status-submitted  { background:#fef9e7; color:#9a7d0a; border:1px solid #f9e79f; }
        .status-submitted .status-dot  { background:#f4d03f; }
        .status-assigned   { background: var(--blue-light); color: var(--blue-dark); border: 1px solid var(--blue-mid); }
        .status-assigned .status-dot   { background: var(--blue); }
        .status-progress   { background:#f4ecf7; color:#6c3483; border:1px solid #d7bde2; }
        .status-progress .status-dot   { background:#9b59b6; }
        .status-closed     { background:#eafaf1; color:#1e8449; border:1px solid #a9dfbf; }
        .status-closed .status-dot     { background:#27ae60; }
       .status-denied     { background:#fdf0ef; color:#c0392b; border:1px solid #f1c0bc; }
.status-denied .status-dot     { background:#c0392b; }
.status-connection-approved  { background: #eaf4fb; color: #1669A9; border: 1px solid #c5ddf0; }
.status-connection-approved .status-dot  { background: #1669A9; }
.status-connection-denied    { background: #fdf0ef; color: #c0392b; border: 1px solid #f1c0bc; }
.status-connection-denied .status-dot    { background: #c0392b; }
        /* ── SECTION CARDS ── */
        .section { margin-bottom: 16px; }

        .section-card {
          background: var(--white);
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .section-head {
          background: var(--blue);
          padding: 14px 22px;
          display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
        }
        .section-head::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .section-icon {
          width: 30px; height: 30px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        .section-title {
          font-size: 14px; font-weight: 600;
          color: #fff; letter-spacing: 0.01em;
          position: relative; z-index: 1;
        }

        .section-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 28px;
        }
        @media (max-width: 520px) { .section-body { grid-template-columns: 1fr; } }
        .full-width { grid-column: span 2; }
        @media (max-width: 520px) { .full-width { grid-column: span 1; } }

        /* ── FIELD ── */
        .field-item { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted);
        }
        .field-value {
          font-size: 14px; color: var(--text); font-weight: 500;
          line-height: 1.5;
        }
        .field-empty { color: var(--text-muted); font-style: italic; font-weight: 400; }

        .amount-value {
          font-family: 'Instrument Serif', serif;
          font-size: 26px; color: var(--text); line-height: 1;
        }

        /* ── LOADING ── */
        .loading-wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px; gap: 14px;
        }
        .spinner-ring {
          width: 36px; height: 36px;
          border: 2px solid rgba(22,105,169,0.15);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 13.5px; color: var(--text-muted); }

        /* ── ERROR ── */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── ACTION BUTTONS ── */
        .btn-accept {
          flex: 1; min-width: 140px;
          padding: 13px 24px; border-radius: 10px; border: none;
          background: var(--blue);
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .btn-accept:hover:not(:disabled) {
          background: var(--blue-dark);
          box-shadow: 0 4px 16px rgba(22,105,169,0.25);
          transform: translateY(-1px);
        }
        .btn-accept:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-deny {
          flex: 1; min-width: 140px;
          padding: 13px 24px; border-radius: 10px;
          border: 1px solid #f1c0bc;
          background: #fdf0ef; color: #c0392b;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .btn-deny:hover:not(:disabled) { background: #fbe0dc; }
        .btn-deny:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-reopen {
          flex: 1; min-width: 140px;
          padding: 13px 24px; border-radius: 10px; border: none;
          background: var(--blue); color: #fff;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, box-shadow 0.15s, transform 0.12s;
        }
        .btn-reopen:hover:not(:disabled) {
          background: var(--blue-dark);
          box-shadow: 0 4px 16px rgba(22,105,169,0.25);
          transform: translateY(-1px);
        }
        .btn-reopen:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-close {
          flex: 1; min-width: 140px;
          padding: 13px 24px; border-radius: 10px;
          border: 1px solid #a9dfbf;
          background: #eafaf1; color: #1e8449;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .btn-close:hover:not(:disabled) { background: #d5f5e3; }
        .btn-close:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-chat {
          flex: 1; min-width: 140px;
          padding: 13px 24px; border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--white); color: var(--text);
          font-size: 14px; font-weight: 600;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-chat:hover { background: var(--off-white); border-color: var(--blue-mid); }

        /* ── FOOTER ── */
        .footer-note {
          text-align: center;
          margin-top: 40px;
          font-size: 11.5px;
          color: #bbb;
          line-height: 1.6;
        }

        /* ── SPINNER INLINE ── */
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .btn-spinner-dark {
          width: 14px; height: 14px;
          border: 2px solid rgba(30,132,73,0.25);
          border-top-color: #1e8449;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .btn-spinner-red {
          width: 14px; height: 14px;
          border: 2px solid rgba(192,57,43,0.25);
          border-top-color: #c0392b;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
      

        <Link to="/agency/dashboard" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="page">

        {loading && (
          <div className="loading-wrap">
            <div className="spinner-ring" />
            <p className="loading-text">Loading claim…</p>
          </div>
        )}

        {!loading && error && (
          <div className="err-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {!loading && claim && (
          <>
            {/* Page Header */}
            <div className="page-header">
              <div>
                <p className="page-eyebrow">Claim Record</p>
                <h1 className="page-title">Claim Details</h1>
                <div className="header-rule" />
                <p className="claim-id">{claim._id}</p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            {(claim.status === 'assigned' || claim.status === 'denied' || claim.status === 'in_progress' || claim.status === 'closed') && (
              <div className="section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

                {actionError && (
                  <div className="err-box" style={{ width: '100%' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {actionError}
                  </div>
                )}

                {claim.status === 'assigned' && (
                  <>
                    <button className="btn-accept" onClick={handleAccept} disabled={!!actionLoading}>
                      {actionLoading === 'accept' ? (
                        <><div className="btn-spinner" /> Accepting…</>
                      ) : (
                        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Accept Claim</>
                      )}
                    </button>
                    <button className="btn-deny" onClick={handleDeny} disabled={!!actionLoading}>
                      {actionLoading === 'deny' ? (
                        <><div className="btn-spinner-red" /> Denying…</>
                      ) : (
                        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Deny Claim</>
                      )}
                    </button>
                  </>
                )}

                {(claim.status === 'denied' || claim.status === 'closed') && (
                  <button className="btn-reopen" onClick={() => setConfirmModal('reopen')} disabled={!!actionLoading}>
                    {actionLoading === 'reopen' ? (
                      <><div className="btn-spinner" /> Reopening…</>
                    ) : (
                      <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg> Reopen Claim</>
                    )}
                  </button>
                )}

                {claim.status === 'in_progress' && (
                  <button className="btn-close" onClick={() => setConfirmModal('close')} disabled={!!actionLoading}>
                    {actionLoading === 'close' ? (
                      <><div className="btn-spinner-dark" /> Closing…</>
                    ) : (
                      <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Success</>
                    )}
                  </button>
                )}

                <Link to="/agency/chat" className="btn-chat">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Chat
                </Link>

              </div>
            )}
            {/* Debtor Information */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Debtor Information</h2>
                </div>
                <div className="section-body">
                  <Field label="Debtor Type"  value={claim.debtor_type === 'individual' ? 'Individual' : 'Business'} />
                  <Field label="Debtor Name"  value={claim.debtor_name} />
                  <Field label="Email"        value={claim.debtor_email} />
                  <Field label="Phone"        value={claim.debtor_phone} />
                  <div className="full-width">
                    <Field label="Address"    value={claim.debtor_address} />
                  </div>
                </div>
              </div>
            </div>

            {/* Debt Information */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Debt Information</h2>
                </div>
                <div className="section-body">
                  <div className="field-item">
                    <p className="field-label">Amount Owed</p>
                    <p className="amount-value">
                      {formatCurrency(claim.amount) || <span className="field-empty">Not provided</span>}
                    </p>
                  </div>
                  <Field label="Due Date" value={formatDate(claim.due_date)} />
                  <div className="full-width">
                    <Field label="Description" value={claim.description} />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Submission Details</h2>
                </div>
                <div className="section-body">
                  <Field label="Submitted On" value={formatDate(claim.createdAt)} />
                  <Field label="Last Updated"  value={formatDate(claim.updatedAt)} />
                </div>
              </div>
            </div>

            {/* Claim Quota */}
            {agency && (
              <div className="section">
                <div className="section-card">
                  <div className="section-head">
                    <div className="section-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <h2 className="section-title">Claim Quota</h2>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Monthly Usage
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                          {agency.claims_used} / {agency.claim_limit}
                        </span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '99px',
                          width: `${Math.min((agency.claims_used / agency.claim_limit) * 100, 100)}%`,
                          background: agency.claims_used >= agency.claim_limit ? '#c0392b' : 'var(--blue)',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'Plan', value: agency.plan_type?.charAt(0).toUpperCase() + agency.plan_type?.slice(1) },
                        { label: 'Claims Left', value: Math.max(agency.claim_limit - agency.claims_used, 0) },
                        { label: 'Total Limit', value: agency.claim_limit },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                          <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {agency.claims_used >= agency.claim_limit && (
                      <div style={{ marginTop: '12px', background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b', fontSize: '13px', padding: '10px 14px', borderRadius: '10px' }}>
                        You've reached your monthly claim limit. Upgrade your plan to accept more claims.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Supporting Documents */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Supporting Documents</h2>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  {claim.documents && claim.documents.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {claim.documents.map((doc, i) => (
                        <li key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          background: 'var(--off-white)', border: '1px solid var(--border)',
                          borderRadius: '10px', padding: '10px 14px',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span style={{
                            flex: 1, fontSize: '13px', fontWeight: 500,
                            color: 'var(--text)', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {doc.filename}
                          </span>
                          <a
                            href={`${BASE_URL}/uploads/${doc.path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11.5px', fontWeight: 600, color: 'var(--blue)',
                              textDecoration: 'none', border: '1px solid var(--blue-mid)',
                              borderRadius: '6px', padding: '4px 10px',
                              flexShrink: 0, transition: 'background 0.15s',
                              background: 'var(--blue-light)',
                            }}
                          >
                            View
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '16px', background: 'var(--off-white)',
                      border: '1px dashed var(--border)', borderRadius: '10px',
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No documents attached to this claim
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
          

            <p className="footer-note">
              We are a technology platform that connects businesses with independent, licensed
              collection agencies. We do not provide debt collection services, legal advice,
              or contact debtors on your behalf.
            </p>

            {/* Confirmation Modals */}
           
          </>
        )}
      </div>
      {confirmModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(26,42,58,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}> 
                <div style={{
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '32px 28px',
                  maxWidth: '440px',
                  width: '100%',
                  boxShadow: '0 8px 40px rgba(26,42,58,0.18)',
                  animation: 'fadeUp 0.25s cubic-bezier(.22,1,.36,1) both',
                }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: confirmModal === 'close' ? '#eafaf1' : 'var(--blue-light)',
                    border: `1px solid ${confirmModal === 'close' ? '#a9dfbf' : 'var(--blue-mid)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    {confirmModal === 'close' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e8449" strokeWidth="2" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                      </svg>
                    )}
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.2 }}>
                    {confirmModal === 'close' ? 'Close this claim?' : 'Reopen this claim?'}
                  </h3>

                  {confirmModal === 'close' ? (
                    <div style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: '8px' }}>
                      <p style={{ marginBottom: '10px' }}>Before closing, please confirm the following:</p>
                      <ul style={{ paddingLeft: '18px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li>The funds for this claim have been <strong style={{ color: 'var(--text)' }}>successfully recovered</strong>.</li>
                        <li>You are certain you want to mark this claim as <strong style={{ color: 'var(--text)' }}>closed</strong>.</li>
                      </ul>
                      <div style={{
                        background: '#fef9e7', border: '1px solid #f9e79f',
                        borderRadius: '10px', padding: '10px 14px',
                        fontSize: '13px', color: '#9a7d0a',
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        If this claim is reopened later, <strong>1 claim point</strong> will be deducted from your package balance.
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: '8px' }}>
                      <p style={{ marginBottom: '12px' }}>
                        You are about to reopen this claim and set it back to <strong style={{ color: 'var(--text)' }}>In Progress</strong>.
                      </p>
                      <div style={{
                        background: '#fdf0ef', border: '1px solid #f1c0bc',
                        borderRadius: '10px', padding: '10px 14px',
                        fontSize: '13px', color: '#c0392b',
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Reopening this claim will deduct <strong>1 claim point</strong> from your package balance. This cannot be undone.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button
                      onClick={() => setConfirmModal(null)}
                      style={{
                        flex: 1, padding: '11px 20px', borderRadius: '10px',
                        border: '1px solid var(--border)', background: 'var(--off-white)',
                        color: 'var(--text)', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.15s',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmModal === 'close' ? handleClose : handleReopen}
                      style={{
                        flex: 1, padding: '11px 20px', borderRadius: '10px', border: 'none',
                        background: confirmModal === 'close' ? '#27ae60' : 'var(--blue)',
                        color: '#fff', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.15s',
                      }}
                    >
                      {confirmModal === 'close' ? 'Yes, close claim' : 'Yes, reopen claim'}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </>
  );
}