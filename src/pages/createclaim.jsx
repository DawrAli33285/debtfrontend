import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL, createClaim } from '../api/auth';

export default function CreateClaim() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    debtor_type: 'individual',
    debtor_name: '',
    debtor_email: '',
    debtor_phone: '',
    debtor_address: '',
    amount: '',
    due_date: '',
    past_due_period: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usageInfo && usageInfo.limit < 999999 && usageInfo.used >= usageInfo.limit) {
      setError('Monthly claim limit reached. Please upgrade your plan.');
      return;
    }
    setLoading(true);
    setError('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, val]) => payload.append(key, val));
    files.forEach(file => payload.append('documents', file));
    const res = await createClaim(payload);
    setLoading(false);
    if (res.claim) {
      // navigate('/agencies');
      setShowSuccessModal(true);
    } else {
      setError(res.message || 'Failed to submit claim');
    }
  };


  const handleContinueToAgencies = () => {
    setShowSuccessModal(false);
    navigate('/agencies');
  };
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${BASE_URL}/auth/getUser`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUsageInfo({
            used:  data.user.claims_used_this_month,
            limit: data.user.monthly_claim_limit,
            plan:  data.user.subscription_plan,
          });
        }
      })
      .catch(() => {});
  }, []);

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
        }
        .logo-mark {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 17px; color: #fff; letter-spacing: 0.01em;
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
        .back-link:hover { color: #fff; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); }

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
        .page-header { margin-bottom: 32px; }
        .page-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--blue); margin-bottom: 6px;
        }
        .page-title {
          font-size: 28px; font-weight: 700;
          color: var(--text); line-height: 1.15;
          margin-bottom: 4px;
        }
        .header-rule {
          width: 48px; height: 3px;
          background: var(--blue);
          border-radius: 2px;
          margin: 14px 0 10px;
        }
        .page-sub { font-size: 13.5px; color: var(--text-muted); }

        /* ── SECTION CARDS ── */
        .section { margin-bottom: 16px; }

        .section-card {
          background: var(--white);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .section-head {
          background: var(--blue);
          padding: 14px 24px;
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
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        .section-title {
          font-size: 14px; font-weight: 600; color: #fff;
          position: relative; z-index: 1;
          letter-spacing: 0.01em;
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

        /* ── FORM FIELDS ── */
        .field-item { display: flex; flex-direction: column; gap: 6px; }

        .field-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted);
        }

        .field-input,
        .field-select,
        .field-textarea {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          color: var(--text);
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          width: 100%;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
          appearance: none;
        }
        .field-input::placeholder,
        .field-textarea::placeholder { color: #bbb; }
        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(22,105,169,0.1);
        }
        .field-textarea { resize: none; line-height: 1.6; }

        /* Custom select arrow */
        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '';
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--text-muted);
          pointer-events: none;
        }

        /* Debtor type toggle */
        .type-toggle { display: flex; gap: 8px; }
        .type-btn {
          flex: 1;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px; font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .type-btn:hover { border-color: var(--blue); color: var(--text); }
        .type-btn.active {
          background: var(--blue);
          border-color: var(--blue);
          color: #fff;
        }

        /* Amount field */
        .amount-wrap { position: relative; }
        .amount-prefix {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px; color: var(--blue);
          font-weight: 600;
          pointer-events: none;
        }
        .amount-input { padding-left: 26px !important; }

        /* ── USAGE BANNER ── */
        .usage-banner {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .usage-banner.blocked {
          background: #fdf0ef;
          border-color: #f1c0bc;
        }
        .usage-banner.warning {
          border-color: #f9e79f;
        }
        .usage-icon {
          width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .usage-title {
          font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 2px;
        }
        .usage-sub { font-size: 11.5px; color: var(--text-muted); }
        .usage-bar-track {
          height: 5px; border-radius: 99px;
          background: var(--border); overflow: hidden; width: 100px;
        }
        .usage-bar-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.4s ease;
        }
        .usage-pct { font-size: 10px; color: var(--text-muted); margin-top: 4px; text-align: right; }

        /* ── LEGAL CONFIRM ── */
        .legal-wrap {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 18px 24px;
          background: var(--off-white);
          border-top: 1px solid var(--border);
        }
        .legal-checkbox {
          width: 15px; height: 15px;
          flex-shrink: 0; margin-top: 2px;
          accent-color: var(--blue);
          cursor: pointer;
        }
        .legal-text { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

        /* ── SUBMIT BUTTON ── */
        .submit-wrap {
          padding: 20px 24px 24px;
          background: var(--white);
          border-top: 1px solid var(--border);
        }
        .submit-btn {
          width: 100%;
          background: var(--blue);
          color: #fff;
          font-family: inherit;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.03em;
          border: none;
          border-radius: 8px;
          padding: 13px 24px;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--blue-dark);
          box-shadow: 0 4px 16px rgba(22,105,169,0.25);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-shimmer {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ERROR ── */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
        }

        /* ── UPLOAD ZONE ── */
        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 28px 20px;
          border: 1.5px dashed var(--border);
          border-radius: 8px;
          background: var(--off-white);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: center;
        }
        .upload-zone:hover {
          border-color: var(--blue);
          background: var(--blue-light);
        }
        .upload-label { font-size: 13px; font-weight: 500; color: var(--text); }
        .upload-sub { font-size: 11px; color: var(--text-muted); }

        /* ── FILE LIST ── */
        .file-list {
          list-style: none;
          display: flex; flex-direction: column; gap: 6px;
          margin-top: 8px;
        }
        .file-item {
          display: flex; align-items: center; gap: 8px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px; font-size: 12px;
        }
        .file-name {
          flex: 1; color: var(--text); font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .file-size { color: var(--text-muted); flex-shrink: 0; }
        .file-remove {
          background: none; border: none; color: var(--text-muted);
          font-size: 16px; line-height: 1; cursor: pointer;
          padding: 0 2px; flex-shrink: 0;
        }
        .file-remove:hover { color: var(--error); }

        /* ── FOOTER ── */
        .footer-note {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          font-size: 11.5px; color: #bbb; line-height: 1.6; text-align: center;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
     
        <Link to="/dashboard" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="page">

        {/* ERROR */}
        {error && (
          <div className="err-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* USAGE BANNER */}
        {usageInfo && (() => {
          const isUnlimited = usageInfo.limit >= 999999;
          const remaining   = isUnlimited ? Infinity : usageInfo.limit - usageInfo.used;
          const pct         = isUnlimited ? 0 : Math.min((usageInfo.used / usageInfo.limit) * 100, 100);
          const isWarning   = !isUnlimited && remaining <= 1;
          const isBlocked   = !isUnlimited && remaining <= 0;
          const planLabel   = usageInfo.plan.charAt(0).toUpperCase() + usageInfo.plan.slice(1);

          return (
            <div className={`usage-banner${isBlocked ? ' blocked' : isWarning ? ' warning' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="usage-icon" style={{
                  background: isBlocked ? 'rgba(192,57,43,0.08)' : 'var(--blue-light)',
                  border: `1px solid ${isBlocked ? 'rgba(192,57,43,0.2)' : 'var(--blue-mid)'}`,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={isBlocked ? '#c0392b' : '#1669A9'} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <p className="usage-title">
                    {isBlocked
                      ? 'Monthly claim limit reached'
                      : isUnlimited
                      ? 'Unlimited claims available'
                      : `${remaining} claim${remaining !== 1 ? 's' : ''} remaining this month`}
                  </p>
                  <p className="usage-sub">
                    {isUnlimited
                      ? `${planLabel} Plan · Unlimited`
                      : `${usageInfo.used} used of ${usageInfo.limit} · ${planLabel} Plan`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {!isUnlimited && (
                  <div>
                    <div className="usage-bar-track">
                      <div className="usage-bar-fill" style={{
                        width: `${pct}%`,
                        background: isBlocked ? '#c0392b' : isWarning ? '#e67e22' : '#1669A9',
                      }} />
                    </div>
                    <p className="usage-pct">{Math.round(pct)}%</p>
                  </div>
                )}
                {isBlocked && (
                  <Link to="/business-plans" style={{
                    background: 'var(--blue)', color: '#fff',
                    fontSize: 12, fontWeight: 600,
                    padding: '7px 14px', borderRadius: 8,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    Upgrade Plan
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          );
        })()}

        {/* PAGE HEADER */}
        <div className="page-header">
          <p className="page-eyebrow">New Claim</p>
          <h1 className="page-title">Submit a claim</h1>
          <div className="header-rule" />
          <p className="page-sub">Fill in the details below to submit a claim for review.</p>
        </div>

        {/* DEBTOR INFORMATION */}
        <div className="section">
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 className="section-title">Debtor information</h2>
            </div>
            <div className="section-body">

              <div className="field-item full-width">
                <p className="field-label">Debtor type</p>
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${form.debtor_type === 'individual' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, debtor_type: 'individual' })}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Individual
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${form.debtor_type === 'business' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, debtor_type: 'business' })}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    </svg>
                    Business
                  </button>
                </div>
              </div>

              <div className="field-item full-width">
                <label className="field-label" htmlFor="debtor_name">Debtor name</label>
                <input id="debtor_name" type="text" name="debtor_name" value={form.debtor_name}
                  onChange={handleChange} required placeholder="Full name or business name" className="field-input" />
              </div>

              <div className="field-item">
                <label className="field-label" htmlFor="debtor_email">Email</label>
                <input id="debtor_email" type="email" name="debtor_email" value={form.debtor_email}
                  onChange={handleChange} placeholder="debtor@email.com" className="field-input" />
              </div>

              <div className="field-item">
                <label className="field-label" htmlFor="debtor_phone">Phone</label>
                <input id="debtor_phone" type="tel" name="debtor_phone" value={form.debtor_phone}
                  onChange={handleChange} placeholder="+1 234 567 8900" className="field-input" />
              </div>

              <div className="field-item full-width">
                <label className="field-label" htmlFor="debtor_address">Address</label>
                <input id="debtor_address" type="text" name="debtor_address" value={form.debtor_address}
                  onChange={handleChange} placeholder="123 Main St, City, State, ZIP" className="field-input" />
              </div>

            </div>
          </div>
        </div>

        {/* DEBT INFORMATION */}
        <div className="section">
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <h2 className="section-title">Debt information</h2>
            </div>
            <div className="section-body">

              <div className="field-item">
                <label className="field-label" htmlFor="amount">Amount owed</label>
                <div className="amount-wrap">
                  <span className="amount-prefix">$</span>
                  <input id="amount" type="number" name="amount" value={form.amount}
                    onChange={handleChange} required placeholder="0.00" min="0"
                    className="field-input amount-input" />
                </div>
              </div>

              <div className="field-item">
                <label className="field-label" htmlFor="due_date">Due date</label>
                <input id="due_date" type="date" name="due_date" value={form.due_date}
                  onChange={handleChange} className="field-input" />
              </div>

              <div className="field-item">
                <label className="field-label" htmlFor="past_due_period">Past due period</label>
                <div className="select-wrap">
                  <select id="past_due_period" name="past_due_period" value={form.past_due_period}
                    onChange={handleChange} className="field-select">
                    <option value="">Select period…</option>
                    <option value="3_months">3 months</option>
                    <option value="6_months">6 months</option>
                    <option value="9_months">9 months</option>
                  </select>
                </div>
              </div>

              <div className="field-item full-width">
                <label className="field-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" value={form.description}
                  onChange={handleChange} rows={4}
                  placeholder="Describe the nature of the debt…"
                  className="field-textarea" />
              </div>

              <div className="field-item full-width">
                <p className="field-label">Supporting documents</p>
                <label htmlFor="doc_upload" className="upload-zone">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="upload-label">
                    {files.length > 0
                      ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                      : 'Click to upload or drag & drop'}
                  </span>
                  <span className="upload-sub">PDF, JPG, PNG, DOC — max 10 MB each, up to 5 files</span>
                  <input id="doc_upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
                </label>
                {files.length > 0 && (
                  <ul className="file-list">
                    {files.map((f, i) => (
                      <li key={i} className="file-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="2" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="file-name">{f.name}</span>
                        <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" className="file-remove"
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* Legal confirmation */}
            <div className="legal-wrap">
              <input type="checkbox" id="legal_confirm" required checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)} className="legal-checkbox" />
              <label htmlFor="legal_confirm" className="legal-text">
                I confirm that the information provided is accurate and that I am authorized
                to submit this claim. I understand that Collection Connector will assign this claim to a
                licensed collection agency and does not perform collection activities directly.
              </label>
            </div>

            {/* Submit */}
            <div className="submit-wrap">
              <button onClick={handleSubmit} disabled={loading || !confirmed} className="submit-btn">
                {loading ? (
                  <><span className="btn-shimmer" /> Submitting claim…</>
                ) : (
                  <>
                    Submit claim for review
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        <div className="footer-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          We are a technology platform that connects businesses with independent, licensed
          collection agencies. We do not provide debt collection services, legal advice,
          or contact debtors on your behalf.
        </div>

      </div>

      {showSuccessModal && (
  <div style={{
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: 'white', borderRadius: '12px', padding: '2rem',
      maxWidth: '440px', width: '90%', textAlign: 'center'
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: '#EAF3DE', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 1rem'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#111' }}>
        Claim Successfully Submitted
      </h2>
      <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '1.5rem' }}>
        Your claim has been successfully submitted. Our system is now preparing your claim for agency review.
        Please continue to the next step to select a collection agency.
      </p>
      <button
        onClick={handleContinueToAgencies}
        style={{
          backgroundColor: '#111', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '10px 24px', fontSize: '14px',
          fontWeight: '500', cursor: 'pointer', width: '100%'
        }}
      >
        Select a Collection Agency
      </button>
    </div>
  </div>
)}
    </>
  );
}