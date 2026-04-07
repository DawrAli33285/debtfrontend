import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClaim } from '../api/auth';

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
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await createClaim(form);
    setLoading(false);
    if (res.claim) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Failed to submit claim');
    }
  };

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
                to submit this claim. I understand that Collections Connector will assign
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