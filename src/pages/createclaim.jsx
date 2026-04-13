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
      navigate('/dashboard');
    } else {
      setError(res.message || 'Failed to submit claim');
    }
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
          margin-bottom: 36px;
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
        .page-sub {
          font-size: 13px; color: var(--muted);
        }

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

        /* ── FORM FIELDS ── */
        .field-item { display: flex; flex-direction: column; gap: 6px; }

        .field-label {
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--muted);
        }

        .field-input,
        .field-select,
        .field-textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--navy);
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          appearance: none;
        }
        .field-input::placeholder,
        .field-textarea::placeholder {
          color: var(--muted);
          font-weight: 400;
        }
        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
          background: var(--white);
        }
        .field-textarea {
          resize: none;
          line-height: 1.6;
        }

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
          border-top: 5px solid var(--muted);
          pointer-events: none;
        }

        /* Debtor type toggle */
        .type-toggle {
          display: flex;
          gap: 8px;
        }
        .type-btn {
          flex: 1;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .type-btn:hover { border-color: var(--gold-d); color: var(--navy); }
        .type-btn.active {
          background: var(--navy);
          border-color: var(--navy);
          color: #fff;
        }
        .type-btn.active svg { stroke: var(--gold); }

        /* Amount field */
        .amount-wrap { position: relative; }
        .amount-prefix {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          font-family: 'Instrument Serif', serif;
          font-size: 16px; color: var(--gold-d);
          pointer-events: none;
        }
        .amount-input { padding-left: 26px !important; }

        /* ── LEGAL CONFIRM ── */
        .legal-wrap {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 18px 24px;
          background: #f8f7f3;
          border-top: 1px solid var(--border);
        }
        .legal-checkbox {
          width: 16px; height: 16px;
          flex-shrink: 0; margin-top: 2px;
          accent-color: var(--gold-d);
          cursor: pointer;
        }
        .legal-text {
          font-size: 12px; color: var(--muted); line-height: 1.6;
        }

        /* ── SUBMIT BUTTON ── */
        .submit-wrap {
          padding: 20px 24px 24px;
          background: var(--white);
          border-top: 1px solid var(--border);
        }
        .submit-btn {
          width: 100%;
          background: var(--navy);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.03em;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          background: var(--navy-2);
          box-shadow: 0 4px 20px rgba(15,31,61,0.25);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-shimmer {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
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
          padding: 12px 16px;
          border-radius: 12px;
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
          border-radius: 12px;
          background: var(--cream);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: center;
        }
        .upload-zone:hover {
          border-color: var(--gold);
          background: #fdf9f0;
        }
        .upload-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--navy);
        }
        .upload-sub {
          font-size: 11px;
          color: var(--muted);
        }

        /* ── FILE LIST ── */
        .file-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
        }
        .file-name {
          flex: 1;
          color: var(--navy);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-size { color: var(--muted); flex-shrink: 0; }
        .file-remove {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          padding: 0 2px;
          flex-shrink: 0;
        }
        .file-remove:hover { color: var(--error); }


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

{/* CLAIMS USAGE BANNER */}
{usageInfo && (() => {
  const isUnlimited = usageInfo.limit >= 999999;
  const remaining   = isUnlimited ? Infinity : usageInfo.limit - usageInfo.used;
  const pct         = isUnlimited ? 0 : Math.min((usageInfo.used / usageInfo.limit) * 100, 100);
  const isWarning   = !isUnlimited && remaining <= 1;
  const isBlocked   = !isUnlimited && remaining <= 0;

  return (
    <div style={{
      background: isBlocked ? '#fdf0ef' : '#fff',
      border: `1px solid ${isBlocked ? '#f1c0bc' : isWarning ? '#f9e79f' : '#e4e2dd'}`,
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      boxShadow: '0 2px 12px rgba(15,31,61,0.04)',
    }}>
      {/* Left: info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
          background: isBlocked ? 'rgba(192,57,43,0.08)' : 'rgba(201,168,76,0.1)',
          border: `1px solid ${isBlocked ? 'rgba(192,57,43,0.2)' : 'rgba(201,168,76,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={isBlocked ? '#c0392b' : '#a8883a'} strokeWidth="1.8" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#0f1f3d', marginBottom: '2px' }}>
            {isBlocked
              ? 'Monthly claim limit reached'
              : isUnlimited
              ? 'Unlimited claims available'
              : `${remaining} claim${remaining !== 1 ? 's' : ''} remaining this month`}
          </p>
          <p style={{ fontSize: '11.5px', color: '#8a95a3' }}>
            {isUnlimited
              ? `${usageInfo.plan.charAt(0).toUpperCase() + usageInfo.plan.slice(1)} Plan · Unlimited`
              : `${usageInfo.used} used of ${usageInfo.limit} · ${usageInfo.plan.charAt(0).toUpperCase() + usageInfo.plan.slice(1)} Plan`}
          </p>
        </div>
      </div>

      {/* Right: progress bar or upgrade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {!isUnlimited && (
          <div style={{ width: '100px' }}>
            <div style={{
              height: '5px', borderRadius: '99px',
              background: '#e4e2dd', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${pct}%`,
                background: isBlocked ? '#c0392b' : isWarning ? '#e67e22' : '#c9a84c',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ fontSize: '10px', color: '#8a95a3', marginTop: '4px', textAlign: 'right' }}>
              {Math.round(pct)}%
            </p>
          </div>
        )}
        {isBlocked && (
          <Link to="/business-plans" style={{
            background: '#0f1f3d', color: '#fff',
            fontSize: '12px', fontWeight: 600,
            padding: '7px 14px', borderRadius: '8px',
            textDecoration: 'none', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: '5px',
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
          <h1 className="page-title">Submit a <em>Claim</em></h1>
          <div className="header-divider" />
          <p className="page-sub">Fill in the details below to submit a claim for review</p>
        </div>

        {/* DEBTOR INFORMATION */}
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

              {/* Debtor Type */}
              <div className="field-item full-width">
                <p className="field-label">Debtor Type</p>
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

              {/* Debtor Name */}
              <div className="field-item full-width">
                <label className="field-label" htmlFor="debtor_name">Debtor Name</label>
                <input
                  id="debtor_name"
                  type="text"
                  name="debtor_name"
                  value={form.debtor_name}
                  onChange={handleChange}
                  required
                  placeholder="Full name or business name"
                  className="field-input"
                />
              </div>

              {/* Email */}
              <div className="field-item">
                <label className="field-label" htmlFor="debtor_email">Email</label>
                <input
                  id="debtor_email"
                  type="email"
                  name="debtor_email"
                  value={form.debtor_email}
                  onChange={handleChange}
                  placeholder="debtor@email.com"
                  className="field-input"
                />
              </div>

              {/* Phone */}
              <div className="field-item">
                <label className="field-label" htmlFor="debtor_phone">Phone</label>
                <input
                  id="debtor_phone"
                  type="tel"
                  name="debtor_phone"
                  value={form.debtor_phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="field-input"
                />
              </div>

              {/* Address */}
              <div className="field-item full-width">
                <label className="field-label" htmlFor="debtor_address">Address</label>
                <input
                  id="debtor_address"
                  type="text"
                  name="debtor_address"
                  value={form.debtor_address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, State, ZIP"
                  className="field-input"
                />
              </div>

            </div>
          </div>
        </div>

        {/* DEBT INFORMATION */}
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

              {/* Amount */}
              <div className="field-item">
                <label className="field-label" htmlFor="amount">Amount Owed</label>
                <div className="amount-wrap">
                  <span className="amount-prefix">$</span>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    min="0"
                    className="field-input amount-input"
                  />
                </div>
              </div>

           {/* Due Date */}
           <div className="field-item">
                <label className="field-label" htmlFor="due_date">Due Date</label>
                <input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              {/* Past Due Period */}
              <div className="field-item">
                <label className="field-label" htmlFor="past_due_period">Past Due Period</label>
                <div className="select-wrap">
                  <select
                    id="past_due_period"
                    name="past_due_period"
                    value={form.past_due_period}
                    onChange={handleChange}
                    className="field-select"
                  >
                    <option value="">Select period…</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="8_months">8 Months</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="field-item full-width">
                <label className="field-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the nature of the debt…"
                  className="field-textarea"
                />
              </div>

              {/* Document Upload */}
              <div className="field-item full-width">
                <p className="field-label">Supporting Documents</p>
                <label htmlFor="doc_upload" className="upload-zone">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round">
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
                  <input
                    id="doc_upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="file-list">
                    {files.map((f, i) => (
                      <li key={i} className="file-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="file-name">{f.name}</span>
                        <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          className="file-remove"
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        >×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* Legal confirmation */}
            <div className="legal-wrap">
              <input
                type="checkbox"
                id="legal_confirm"
                required
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="legal-checkbox"
              />
              <label htmlFor="legal_confirm" className="legal-text">
                I confirm that the information provided is accurate and that I am authorized
                to submit this claim. I understand that Pasado will assign
                this claim to a licensed collection agency and does not perform collection
                activities directly.
              </label>
            </div>

            {/* Submit */}
            <div className="submit-wrap">
              <button
                onClick={handleSubmit}
                disabled={loading || !confirmed}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="btn-shimmer" />
                    Submitting Claim…
                  </>
                ) : (
                  <>
                    Submit Claim for Review
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

        <p className="footer-note">
          We are a technology platform that connects businesses with independent, licensed
          collection agencies. We do not provide debt collection services, legal advice,
          or contact debtors on your behalf.
        </p>

      </div>
    </>
  );
}