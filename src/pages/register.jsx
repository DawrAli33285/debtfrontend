import { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    password: '',
    ein: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await registerUser({ ...form, role: 'user' });
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      navigate('/business-plans');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

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

        .reg-root {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--off-white);
        }

        /* ── Left panel ── */
        .reg-left {
          display: none;
          width: 42%;
          background: var(--blue);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .reg-left { display: flex; } }

        .reg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 20% 100%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 10%,  rgba(255,255,255,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .reg-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .left-brand { position: relative; z-index: 1; }
        .left-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 64px;
        }
        .logo-mark {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-mark svg { width: 18px; height: 18px; }
        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 17px;
          color: #fff;
          letter-spacing: 0.01em;
        }

        .left-headline {
          font-family: 'Instrument Serif', serif;
          font-size: 38px;
          line-height: 1.18;
          color: #fff;
          margin-bottom: 20px;
        }
        .left-headline em { color: rgba(255,255,255,0.75); font-style: italic; }

        .left-sub {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
          font-weight: 300;
          max-width: 320px;
        }

        /* feature pills */
        .left-pills {
          display: flex; flex-direction: column; gap: 12px;
          position: relative; z-index: 1;
        }
        .pill {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 14px 18px;
        }
        .pill-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: rgba(255,255,255,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .pill-icon svg { width: 15px; height: 15px; stroke: #fff; fill: none; stroke-width: 1.8; }
        .pill-text { font-size: 13px; color: rgba(255,255,255,0.72); font-weight: 400; line-height: 1.4; }

        /* ── Right panel ── */
        .reg-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .reg-card {
          width: 100%;
          max-width: 440px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-header { margin-bottom: 36px; }

        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo .logo-mark-blue {
          width: 36px; height: 36px;
          background: var(--blue);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo .logo-text-blue {
          font-size: 20px; font-weight: 700; color: var(--blue); letter-spacing: -0.01em;
        }

        .card-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--blue); margin-bottom: 8px;
        }
        .card-title {
          font-size: 28px; font-weight: 700;
          color: var(--text); margin-bottom: 6px; line-height: 1.15;
        }
        .header-rule {
          width: 48px; height: 3px;
          background: var(--blue); border-radius: 2px;
          margin: 14px 0 10px;
        }
        .card-sub { font-size: 13.5px; color: var(--text-muted); font-weight: 400; }

        /* error */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

        .field label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 7px;
        }
        .field input {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: inherit;
          color: var(--text);
          background: var(--white);
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .field input::placeholder { color: #bbb; }
        .field input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(22,105,169,0.1);
        }

        /* checkbox */
        .agree-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 26px;
        }
        .agree-row input[type="checkbox"] {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;
          accent-color: var(--blue); cursor: pointer;
        }
        .agree-row label {
          font-size: 12px; line-height: 1.6;
          color: var(--text-muted); cursor: pointer;
        }
        .agree-row label a { color: var(--blue); text-decoration: underline; }

        /* submit */
        .btn-submit {
          width: 100%;
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 13px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .btn-submit:hover:not(:disabled) {
          background: var(--blue-dark);
          box-shadow: 0 4px 16px rgba(22,105,169,0.25);
          transform: translateY(-1px);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .signin-link {
          text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 22px;
        }
        .signin-link a { color: var(--blue); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }

        /* agency card */
        .agency-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 24px 0 12px;
          font-size: 11px; color: var(--text-muted);
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .agency-divider span { flex: 1; height: 1px; background: var(--border); }

        .agency-card {
          display: flex; align-items: center; gap: 14px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
        }
        .agency-logo-mark {
          width: 34px; height: 34px;
          background: var(--blue);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .agency-card-title {
          font-size: 13px; font-weight: 600; color: var(--text); margin: 0 0 2px;
        }
        .agency-card-sub {
          font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;
        }
        .agency-signup-link {
          font-size: 12px; font-weight: 600; color: var(--blue);
          text-decoration: underline; text-underline-offset: 2px; white-space: nowrap;
        }
        .agency-signup-link:hover { color: var(--blue-dark); }

        @media (max-width: 600px) {
          .reg-right { padding: 32px 16px; }
        }
      `}</style>

      <div className="reg-root">

        {/* ── Left decorative panel ── */}
        <aside className="reg-left">
          <div className="left-brand">
            <div className="left-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text">Collection Connector</span>
            </div>
            <h2 className="left-headline">
              Smarter debt recovery,<br /><em>without the friction.</em>
            </h2>
            <p className="left-sub">
              Connect your business to a vetted network of licensed collection agencies — fully compliant, fully managed.
            </p>
          </div>

          <div className="left-pills">
            {[
              {
                label: 'Licensed agency network',
                desc: 'Every partner is verified and compliant',
                icon: <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: 'Secure claim submission',
                desc: 'Bank-grade encryption on every transfer',
                icon: <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: 'Real-time status tracking',
                desc: 'Know exactly where every claim stands',
                icon: <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
            ].map((p) => (
              <div className="pill" key={p.label}>
                <div className="pill-icon">{p.icon}</div>
                <div>
                  <div className="pill-text" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{p.label}</div>
                  <div className="pill-text">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="reg-right">
          <div className="reg-card">

            <div className="card-header">
              <div className="mobile-logo">
                <div className="agency-logo-mark" style={{ width: 36, height: 36 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="mobile-logo-text" style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.01em' }}>Collection Connector</span>
              </div>

              <p className="card-eyebrow">Get started</p>
              <h1 className="card-title">Create your account</h1>
              <div className="header-rule" />
              <p className="card-sub">Set up your business profile to start submitting claims.</p>
            </div>

            {error && <div className="err-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="business_name">Business Name</label>
                    <input
                      id="business_name"
                      type="text"
                      name="business_name"
                      value={form.business_name}
                      onChange={handleChange}
                      required
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact_name">Contact Name</label>
                    <input
                      id="contact_name"
                      type="text"
                      name="contact_name"
                      value={form.contact_name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="ein">Business EIN</label>
                  <input
                    id="ein"
                    type="text"
                    name="ein"
                    value={form.ein}
                    onChange={handleChange}
                    required
                    placeholder="XX-XXXXXXX"
                    maxLength={10}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@acme.com"
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="agree-row">
                <input
                  type="checkbox"
                  id="auth_check"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                />
                <label htmlFor="auth_check">
                  I authorize Collection Connector to submit claims on my behalf to licensed
                  collection agencies. I understand this platform does not perform debt
                  collection or contact debtors directly.
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading || !agreed}>
                <span className="btn-inner">
                  {loading && <span className="spinner" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </span>
              </button>
            </form>

            <p className="signin-link">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>

            <div className="agency-divider">
              <span />&nbsp;Are you a collection agency?&nbsp;<span />
            </div>

            <div className="agency-card">
              <div className="agency-logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p className="agency-card-title">Register your agency</p>
                <p className="agency-card-sub">Join our vetted network and receive matched claims.</p>
              </div>
              <Link to="/agency/register" className="agency-signup-link">Sign up ›</Link>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}