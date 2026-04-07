import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClaimById } from '../api/auth';

const STATUS_META = {
  submitted:   { label: 'Submitted',   cls: 'status-submitted'  },
  assigned:    { label: 'Assigned',    cls: 'status-assigned'   },
  in_progress: { label: 'In Progress', cls: 'status-progress'   },
  closed:      { label: 'Closed',      cls: 'status-closed'     },
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

export default function ClaimDetail() {
  const { id } = useParams();
  const [claim, setClaim]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getClaimById(id);
      setLoading(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:   #0f1f3d;
          --navy-2: #162847;
          --gold:   #c9a84c;
          --gold-l: #e2c97e;
          --gold-d: #a8883a;
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --white:  #ffffff;
          --error:  #c0392b;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--navy); }

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
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
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
          font-size: 16px; color: #fff; letter-spacing: 0.01em;
        }
        .back-link {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s;
        }
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.28); }

        /* ── PAGE ── */
        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
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
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--gold-d); margin-bottom: 6px;
        }
        .page-title {
          font-family: 'Instrument Serif', serif;
          font-size: 34px; color: var(--navy); line-height: 1.1;
        }
        .page-title em { color: var(--gold); font-style: italic; }
        .header-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 40px; margin: 12px 0 8px;
        }
        .claim-id {
          font-size: 11px; color: var(--muted);
          font-family: 'DM Sans', monospace; letter-spacing: 0.04em;
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
        .status-assigned   { background:#eaf2ff; color:#1a5276; border:1px solid #aed6f1; }
        .status-assigned .status-dot   { background:#3498db; }
        .status-progress   { background:#f4ecf7; color:#6c3483; border:1px solid #d7bde2; }
        .status-progress .status-dot   { background:#9b59b6; }
        .status-closed     { background:#eafaf1; color:#1e8449; border:1px solid #a9dfbf; }
        .status-closed .status-dot     { background:#27ae60; }

        /* ── SECTION CARDS ── */
        .section { margin-bottom: 16px; }

        .section-card {
          background: var(--white);
          border-radius: 18px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(15,31,61,0.045);
        }

        .section-head {
          background: var(--navy);
          padding: 16px 24px;
          display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
        }
        .section-head::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .section-icon {
          width: 30px; height: 30px;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 17px; color: #fff;
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
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--muted);
        }
        .field-value {
          font-size: 14px; color: var(--navy); font-weight: 500;
          line-height: 1.5;
        }
        .field-empty { color: var(--muted); font-style: italic; font-weight: 400; }

        /* amount highlight */
        .amount-value {
          font-family: 'Instrument Serif', serif;
          font-size: 26px; color: var(--navy); line-height: 1;
        }

        /* ── LOADING ── */
        .loading-wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px; gap: 14px;
        }
        .spinner-ring {
          width: 36px; height: 36px;
          border: 2px solid rgba(15,31,61,0.12);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 13.5px; color: var(--muted); }

        /* ── ERROR ── */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── FOOTER ── */
        .footer-note {
          text-align: center;
          margin-top: 40px;
          font-size: 11.5px;
          color: #bbb;
          line-height: 1.6;
        }
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
        <Link to="/dashboard" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="page">

        {/* LOADING */}
        {loading && (
          <div className="loading-wrap">
            <div className="spinner-ring" />
            <p className="loading-text">Loading claim…</p>
          </div>
        )}

        {/* ERROR */}
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

        {/* CONTENT */}
        {!loading && claim && (
          <>
            {/* Page Header */}
            <div className="page-header">
              <div>
                <p className="page-eyebrow">Claim Record</p>
                <h1 className="page-title">Claim <em>Details</em></h1>
                <div className="header-divider" />
                <p className="claim-id">{claim._id}</p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            {/* Debtor Information */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Submission Details</h2>
                </div>
                <div className="section-body">
                  <Field label="Submitted On"  value={formatDate(claim.createdAt)} />
                  <Field label="Last Updated"  value={formatDate(claim.updatedAt)} />
                </div>
              </div>
            </div>

            <p className="footer-note">
              We are a technology platform that connects businesses with independent, licensed
              collection agencies. We do not provide debt collection services, legal advice,
              or contact debtors on your behalf.
            </p>
          </>
        )}
      </div>
    </>
  );
}