import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL, getClaimById } from '../api/auth';

const STATUS_META = {
  submitted:            { label: 'Submitted',            cls: 'status-submitted'          },
  assigned:             { label: 'Assigned',             cls: 'status-assigned'           },
  in_progress:          { label: 'In Progress',          cls: 'status-progress'           },
  closed:               { label: 'Closed',               cls: 'status-closed'             },
  connection_approved:  { label: 'Connection Approved',  cls: 'status-connection-approved'},
  connection_denied:    { label: 'Connection Denied',    cls: 'status-connection-denied'  },
};



const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid var(--blue-mid)', borderRadius: 8,
  fontSize: 13.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: 'var(--text)', background: '#fff',
  outline: 'none', transition: 'border-color 0.15s',
  boxShadow: '0 0 0 3px rgba(22,105,169,0.08)',
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

export default function ClaimEdit() {
  const { id } = useParams();
  const [claim, setClaim]         = useState(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm]           = useState({});

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getClaimById(id);
      setLoading(false);
      if (res.claim) {
        setClaim(res.claim);
        setForm({
          debtor_name:    res.claim.debtor_name    || '',
          debtor_email:   res.claim.debtor_email   || '',
          debtor_phone:   res.claim.debtor_phone   || '',
          debtor_address: res.claim.debtor_address || '',
          debtor_type:    res.claim.debtor_type    || 'individual',
          amount:         res.claim.amount         || '',
          due_date:       res.claim.due_date ? res.claim.due_date.slice(0, 10) : '',
          description:    res.claim.description    || '',
        });
      } else {
        setError(res.message || 'Failed to load claim');
      }
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/claims/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setClaim(data.claim);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    }
    setSaving(false);
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  const formatCurrency = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null;

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
        .nav-actions { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .back-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.65);
          text-decoration: none; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); }
        .btn-nav-primary {
          background: rgba(255,255,255,0.15); color: #fff;
          border: 1px solid rgba(255,255,255,0.35); border-radius: 8px; padding: 8px 16px;
          font-size: 13px; font-family: inherit; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-nav-primary:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.55); }

        /* PAGE */
        .page {
          max-width: 720px; margin: 0 auto;
          padding: 48px 32px 80px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 600px) { .page { padding: 32px 16px 60px; } .navbar { padding: 0 16px; } }

        /* PAGE HEADER */
        .page-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-bottom: 6px; }
        .page-title { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1.15; margin-bottom: 4px; }
        .header-rule { width: 48px; height: 3px; background: var(--blue); border-radius: 2px; margin: 14px 0 8px; }
        .claim-id { font-size: 11.5px; color: var(--text-muted); font-family: monospace; letter-spacing: 0.04em; }
        .page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 32px; flex-wrap: wrap;
        }

        /* STATUS BADGE */
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

        /* SECTION CARDS */
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

        /* FIELDS */
        .field-item { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-muted); }
        .field-value { font-size: 14px; color: var(--text); font-weight: 500; line-height: 1.5; }
        .field-empty { color: var(--text-muted); font-style: italic; font-weight: 400; }
        .amount-value { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; }

        /* LOADING */
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 14px; }
        .spinner-ring {
          width: 32px; height: 32px;
          border: 2px solid rgba(22,105,169,0.15);
          border-top-color: var(--blue);
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 13.5px; color: var(--text-muted); }

        /* ERROR */
        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc; color: var(--error);
          font-size: 13px; padding: 12px 16px; border-radius: 10px;
          display: flex; align-items: center; gap: 8px;
        }

        /* BUTTONS */
        .btn-edit {
          background: var(--blue); color: #fff; border: none;
          border-radius: 8px; padding: 8px 16px; font-size: 13px;
          font-family: inherit; font-weight: 600;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s;
        }
        .btn-edit:hover { background: var(--blue-dark); }
        .btn-cancel {
          background: none; color: var(--text-muted); border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 14px; font-size: 13px;
          font-family: inherit; font-weight: 500; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-cancel:hover { border-color: var(--text-muted); color: var(--text); }
        .btn-save {
          background: var(--blue); color: #fff; border: none;
          border-radius: 8px; padding: 8px 16px; font-size: 13px;
          font-family: inherit; font-weight: 600;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s;
        }
        .btn-save:not(:disabled) { cursor: pointer; }
        .btn-save:not(:disabled):hover { background: var(--blue-dark); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        /* SKELETON */
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--off-white) 25%, var(--border) 50%, var(--off-white) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* FOOTER */
        .footer-note { text-align: center; margin-top: 40px; font-size: 11.5px; color: var(--text-muted); line-height: 1.6; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-actions">
          <Link to="/claims" className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            My Claims
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
            {/* PAGE HEADER */}
            <div className="page-header">
              <div>
                <p className="page-eyebrow">Claim Record</p>
                <h1 className="page-title">Claim Details</h1>
                <div className="header-rule" />
                <p className="claim-id">{claim._id}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <StatusBadge status={claim.status} />
                {!editing ? (
                  <button className="btn-edit" onClick={() => setEditing(true)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Claim
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-cancel" onClick={() => { setEditing(false); setSaveError(''); }}>
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                )}
                {saveError && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 2 }}>{saveError}</p>}
              </div>
            </div>

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
                  <div className="field-item">
                    <p className="field-label">Debtor Type</p>
                    {editing ? (
                      <select value={form.debtor_type} onChange={set('debtor_type')} style={inputStyle}>
                        <option value="individual">Individual</option>
                        <option value="business">Business</option>
                      </select>
                    ) : (
                      <p className="field-value">{claim.debtor_type === 'individual' ? 'Individual' : 'Business'}</p>
                    )}
                  </div>
                  <div className="field-item">
                    <p className="field-label">Debtor Name</p>
                    {editing
                      ? <input value={form.debtor_name} onChange={set('debtor_name')} style={inputStyle} />
                      : <p className="field-value">{claim.debtor_name || <span className="field-empty">Not provided</span>}</p>}
                  </div>
                  <div className="field-item">
                    <p className="field-label">Email</p>
                    {editing
                      ? <input value={form.debtor_email} onChange={set('debtor_email')} style={inputStyle} />
                      : <p className="field-value">{claim.debtor_email || <span className="field-empty">Not provided</span>}</p>}
                  </div>
                  <div className="field-item">
                    <p className="field-label">Phone</p>
                    {editing
                      ? <input value={form.debtor_phone} onChange={set('debtor_phone')} style={inputStyle} />
                      : <p className="field-value">{claim.debtor_phone || <span className="field-empty">Not provided</span>}</p>}
                  </div>
                  <div className="full-width">
                    <div className="field-item">
                      <p className="field-label">Address</p>
                      {editing
                        ? <input value={form.debtor_address} onChange={set('debtor_address')} style={inputStyle} />
                        : <p className="field-value">{claim.debtor_address || <span className="field-empty">Not provided</span>}</p>}
                    </div>
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
                    <p className="field-label">Amount</p>
                    {editing
                      ? <input type="number" value={form.amount} onChange={set('amount')} style={inputStyle} />
                      : <p className="amount-value">{formatCurrency(claim.amount)}</p>}
                  </div>
                  <div className="field-item">
                    <p className="field-label">Due Date</p>
                    {editing
                      ? <input type="date" value={form.due_date} onChange={set('due_date')} style={inputStyle} />
                      : <p className="field-value">{formatDate(claim.due_date) || <span className="field-empty">Not provided</span>}</p>}
                  </div>
                  <div className="full-width">
                    <div className="field-item">
                      <p className="field-label">Description</p>
                      {editing
                        ? <textarea value={form.description} onChange={set('description')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                        : <p className="field-value">{claim.description || <span className="field-empty">Not provided</span>}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            {!editing && (
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
            )}

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

                  {/* Existing documents */}
                  {claim.documents && claim.documents.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: editing ? 16 : 0 }}>
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
                          <a href={`https://debtbackend.vercel.app/uploads/${doc.path}`} target="_blank" rel="noreferrer" style={{
                            fontSize: 11.5, fontWeight: 600, color: 'var(--blue)',
                            textDecoration: 'none', border: '1px solid var(--blue-mid)',
                            borderRadius: 6, padding: '4px 10px', flexShrink: 0,
                            transition: 'background 0.14s, color 0.14s',
                          }}>
                            View
                          </a>
                          {editing && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${BASE_URL}/claims/${id}/documents/${doc._id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                const data = await res.json();
                                if (res.ok) setClaim(data.claim);
                              }}
                              style={{
                                background: 'none', border: '1px solid #f1c0bc', borderRadius: 6,
                                padding: '4px 8px', cursor: 'pointer', color: 'var(--error)',
                                fontSize: 11.5, fontWeight: 600, flexShrink: 0, fontFamily: 'inherit',
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !editing && (
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
                    )
                  )}

                  {/* Upload new documents when editing */}
                  {editing && (
                    <div style={{ marginTop: claim.documents?.length ? 8 : 0 }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', background: 'var(--blue-light)',
                        border: '1.5px dashed var(--blue)', borderRadius: 10,
                        cursor: 'pointer', fontSize: 13, color: 'var(--blue)', fontWeight: 500,
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Click to upload additional documents
                        <input
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            if (!files.length) return;
                            const formData = new FormData();
                            files.forEach(f => formData.append('documents', f));
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${BASE_URL}/claims/${id}/documents`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok) setClaim(data.claim);
                          }}
                        />
                      </label>
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
    </>
  );
}