import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClaimById, closeBusinessClaim } from '../api/auth';


const STATUS_META = {
  submitted:            { label: 'Submitted',            cls: 'status-submitted'           },
  assigned:             { label: 'Assigned',             cls: 'status-assigned'            },
  in_progress:          { label: 'In Progress',          cls: 'status-progress'            },
  closed:               { label: 'Closed',               cls: 'status-closed'              },
  connection_approved:  { label: 'Connection Approved',  cls: 'status-connection-approved' },
  connection_denied:    { label: 'Connection Denied',    cls: 'status-connection-denied'   },
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
  const [claim, setClaim]       = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [closeModal, setCloseModal]         = useState(false);
  const [secondaryConfirm, setSecondaryConfirm] = useState(false);
  const [closeLoading, setCloseLoading]     = useState(false);
  const [closeError, setCloseError]         = useState('');


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

  const claimAgeHours = claim
  ? (Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60)
  : 0;
const isHighValue   = claim && Number(claim.amount) >= 10000;
const isClosed      = claim?.status === 'closed';

const handleBusinessClose = async () => {
  setCloseLoading(true); setCloseError('');
  const res = await closeBusinessClaim(id);
  setCloseLoading(false);
  if (res.claim) { setClaim(res.claim); setCloseModal(false); setSecondaryConfirm(false); }
  else setCloseError(res.message || 'Failed to close claim');
};

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

        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--off-white); color: var(--text); }

        /* ── NAVBAR ── */
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
        .nav-actions { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .back-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.65);
          text-decoration: none; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); }

        /* ── PAGE ── */
        .page {
          max-width: 720px; margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 600px) { .page { padding: 32px 16px 60px; } .navbar { padding: 0 16px; } }

        /* ── PAGE HEADER ── */
        .page-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-bottom: 6px; }
        .page-title { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 4px; }
        .header-rule { width: 48px; height: 3px; background: var(--blue); border-radius: 2px; margin: 14px 0 8px; }
        .claim-id { font-size: 11.5px; color: var(--text-muted); font-family: monospace; letter-spacing: 0.04em; }
        .page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 32px; flex-wrap: wrap;
        }

        /* ── STATUS BADGE ── */
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
.status-connection-approved  { background: #eaf4fb; color: #1669A9; border: 1px solid #c5ddf0; }
.status-connection-approved .status-dot  { background: #1669A9; }
.status-connection-denied    { background: #fdf0ef; color: #c0392b; border: 1px solid #f1c0bc; }
.status-connection-denied .status-dot    { background: #c0392b; }

        /* ── SECTION CARDS ── */
        .section { margin-bottom: 16px; }
        .section-card {
          background: var(--white); border-radius: 12px;
          border: 1px solid var(--border); overflow: hidden;
        }
        .section-head {
          background: var(--blue); padding: 14px 24px;
          display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
        }
        .section-head::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px; pointer-events: none;
        }
        .section-icon {
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .section-title {
          font-size: 14px; font-weight: 600; color: #fff;
          position: relative; z-index: 1; letter-spacing: 0.01em;
        }
        .section-body {
          padding: 24px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px;
        }
        @media (max-width: 520px) { .section-body { grid-template-columns: 1fr; } }
        .full-width { grid-column: span 2; }
        @media (max-width: 520px) { .full-width { grid-column: span 1; } }

        /* ── FIELDS ── */
        .field-item { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-muted); }
        .field-value { font-size: 14px; color: var(--text); font-weight: 500; line-height: 1.5; }
        .field-empty { color: var(--text-muted); font-style: italic; font-weight: 400; }
        .amount-value { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; }

        /* ── LOADING ── */
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 14px; }
        .spinner-ring {
          width: 32px; height: 32px;
          border: 2px solid rgba(22,105,169,0.15);
          border-top-color: var(--blue);
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 13.5px; color: var(--text-muted); }

        /* ── ERROR ── */
        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc; color: var(--error);
          font-size: 13px; padding: 12px 16px; border-radius: 10px;
          display: flex; align-items: center; gap: 8px;
        }

         /* ── CLOSE BUTTON ── */
        .btn-close-claim {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 10px;
          border: 1px solid #f1c0bc; background: #fdf0ef; color: #c0392b;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-close-claim:hover:not(:disabled) { background: #fbe0dc; }
        .btn-close-claim:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-spinner-red {
          width: 14px; height: 14px;
          border: 2px solid rgba(192,57,43,0.25); border-top-color: #c0392b;
          border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* ── FOOTER ── */
        .footer-note { text-align: center; margin-top: 40px; font-size: 11.5px; color: var(--text-muted); line-height: 1.6; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-actions">
          <Link to="/dashboard" className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Dashboard
          </Link>
        </div>
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
                <h1 className="page-title">Claim Details</h1>
                <div className="header-rule" />
                <p className="claim-id">{claim._id}</p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            {!isClosed && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button
                  className="btn-close-claim"
                  onClick={() => { setCloseModal(true); setSecondaryConfirm(false); setCloseError(''); }}
                  disabled={closeLoading}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Close Claim
                </button>
              </div>
            )}

            {/* Debtor Information */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
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
                  <Field label="Due Date"    value={formatDate(claim.due_date)} />
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
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

            {/* Supporting Documents */}
            <div className="section">
              <div className="section-card">
                <div className="section-head">
                  <div className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <h2 className="section-title">Supporting Documents</h2>
                </div>

                <div style={{ padding: '20px 24px' }}>
                  {claim.documents && claim.documents.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {claim.documents.map((doc, i) => (
                        <li key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          background: 'var(--off-white)', border: '1px solid var(--border)',
                          borderRadius: 10, padding: '10px 14px',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span style={{
                            flex: 1, fontSize: 13, fontWeight: 500,
                            color: 'var(--text)', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {doc.filename}
                          </span>
                          <a
                            href={`https://debtbackend.vercel.app/uploads/${doc.path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11.5, fontWeight: 600, color: 'var(--blue)',
                              textDecoration: 'none', border: '1px solid var(--blue-mid)',
                              borderRadius: 6, padding: '4px 10px', flexShrink: 0,
                              transition: 'background 0.14s, color 0.14s',
                            }}
                          >
                            View
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: 16, background: 'var(--off-white)',
                      border: '1px dashed var(--border)', borderRadius: 10,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No documents attached to this claim
                      </span>
                    </div>
                  )}
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


      {closeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(26,42,58,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: '16px',
            border: '1px solid var(--border)', padding: '32px 28px',
            maxWidth: '460px', width: '100%',
            boxShadow: '0 8px 40px rgba(26,42,58,0.18)',
            animation: 'fadeUp 0.25s cubic-bezier(.22,1,.36,1) both',
          }}>

            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: '#fdf0ef', border: '1px solid #f1c0bc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2 }}>
              Close Claim Confirmation
            </h3>

            {/* Consequence bullets */}
            <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                {claimAgeHours > 24
                  ? <><strong style={{ color: '#c0392b' }}>This claim is over 24 hours old</strong> — closing it will count against your package usage.</>
                  : <>Closing within 24 hours of submission — <strong style={{ color: '#1e8449' }}>no package deduction</strong> will apply.</>
                }
              </li>
              <li>Closing this claim will <strong style={{ color: 'var(--text)' }}>notify the agency</strong> currently working on it.</li>
              <li>You will <strong style={{ color: 'var(--text)' }}>forfeit all progress and communication</strong> associated with this claim.</li>
            </ul>

            {/* 24-hour rule callout */}
            <div style={{
              background: claimAgeHours > 24 ? '#fdf0ef' : '#eafaf1',
              border: `1px solid ${claimAgeHours > 24 ? '#f1c0bc' : '#a9dfbf'}`,
              borderRadius: '10px', padding: '10px 14px',
              fontSize: '13px', color: claimAgeHours > 24 ? '#c0392b' : '#1e8449',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              marginBottom: '14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {claimAgeHours > 24
                ? <>Claim age: <strong>{Math.floor(claimAgeHours)}h</strong> — 1 claim point will be deducted.</>
                : <>Claim age: <strong>{Math.floor(claimAgeHours)}h {Math.floor((claimAgeHours % 1) * 60)}m</strong> — within the free cancellation window.</>
              }
            </div>

            {/* High-value secondary confirmation */}
            {isHighValue && (
              <div style={{
                background: '#fef9e7', border: '1px solid #f9e79f',
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '13px', color: '#9a7d0a',
                marginBottom: '14px',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <input
                  type="checkbox"
                  id="highValueConfirm"
                  checked={secondaryConfirm}
                  onChange={e => setSecondaryConfirm(e.target.checked)}
                  style={{ marginTop: '2px', flexShrink: 0, accentColor: '#9a7d0a', cursor: 'pointer' }}
                />
                <label htmlFor="highValueConfirm" style={{ cursor: 'pointer', lineHeight: 1.55 }}>
                  <strong>High-value claim ({formatCurrency(claim?.amount)}).</strong> I understand this action cannot be undone.
                </label>
              </div>
            )}

            {/* API error */}
            {closeError && (
              <div style={{
                background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b',
                fontSize: '13px', padding: '10px 14px', borderRadius: '10px',
                marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {closeError}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => { setCloseModal(false); setSecondaryConfirm(false); setCloseError(''); }}
                disabled={closeLoading}
                style={{
                  flex: 1, padding: '11px 20px', borderRadius: '10px',
                  border: '1px solid var(--border)', background: 'var(--off-white)',
                  color: 'var(--text)', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBusinessClose}
                disabled={closeLoading || (isHighValue && !secondaryConfirm)}
                style={{
                  flex: 1, padding: '11px 20px', borderRadius: '10px', border: 'none',
                  background: (closeLoading || (isHighValue && !secondaryConfirm)) ? '#e0e0e0' : '#c0392b',
                  color: (closeLoading || (isHighValue && !secondaryConfirm)) ? '#999' : '#fff',
                  fontSize: '14px', fontWeight: 600,
                  cursor: (closeLoading || (isHighValue && !secondaryConfirm)) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {closeLoading
                  ? <><div className="btn-spinner-red" style={{ borderTopColor: '#999' }} /> Closing…</>
                  : 'Confirm Close Claim'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}