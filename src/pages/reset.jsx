import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, newPassword: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Reset failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#c0392b', '#e67e22', '#2980b9', '#27ae60'][strength];

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
          --success:    #1a7a4a;
        }

        .rp-root {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--off-white);
        }

        /* ── Left panel ── */
        .rp-left {
          display: none;
          width: 42%;
          background: var(--blue);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .rp-left { display: flex; } }

        .rp-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 20% 100%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 10%,  rgba(255,255,255,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .rp-left::after {
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
        .rp-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .rp-card {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-header { margin-bottom: 32px; }

        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }

        .mobile-logo-mark {
          width: 36px; height: 36px;
          background: var(--blue);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
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

        /* notification boxes */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .success-box {
          background: #edfaf4;
          border: 1px solid #a8e0c1;
          color: var(--success);
          font-size: 13.5px;
          padding: 20px 18px;
          border-radius: 12px;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .success-box strong { display: block; font-size: 15px; margin-bottom: 4px; }
        .success-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: #d4f4e4;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 26px; }

        .field label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 7px;
        }
        .field-input-wrap { position: relative; }
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
        .field input.has-toggle { padding-right: 40px; }

        .pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .pw-toggle:hover { color: var(--blue); }

        /* strength bar */
        .strength-row {
          display: flex; align-items: center; gap: 8px; margin-top: 8px;
        }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          background: var(--border); transition: background 0.3s;
        }
        .strength-label { font-size: 11px; font-weight: 700; min-width: 36px; text-align: right; }

        /* match indicator */
        .match-hint {
          font-size: 11.5px; margin-top: 6px;
          display: flex; align-items: center; gap: 5px;
        }

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
          margin-bottom: 20px;
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

        .back-link {
          text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 4px;
        }
        .back-link a { color: var(--blue); font-weight: 600; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }

        .security-note {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 28px; padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .security-note span { font-size: 11.5px; color: #bbb; line-height: 1.4; }

        @media (max-width: 600px) {
          .rp-right { padding: 32px 16px; }
        }
      `}</style>

      <div className="rp-root">

        {/* ── Left panel ── */}
        <aside className="rp-left">
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
              Reset your<br /><em>password</em><br />securely.
            </h2>
            <p className="left-sub">
              Follow the steps on the right to regain access to your account. Your data remains safe throughout the process.
            </p>
          </div>

          <div className="left-pills">
            {[
              {
                label: 'Verify your identity',
                desc: 'Enter the email address linked to your account',
                icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: 'Set a new password',
                desc: 'Choose a strong password you haven\'t used before',
                icon: <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: 'Sign back in',
                desc: 'Use your new credentials to access your dashboard',
                icon: <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="10 17 15 12 10 7" strokeLinecap="round" strokeLinejoin="round"/><line x1="15" y1="12" x2="3" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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
        <main className="rp-right">
          <div className="rp-card">

            <div className="card-header">
              <div className="mobile-logo">
                <div className="mobile-logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.01em' }}>Collection Connector</span>
              </div>

              <p className="card-eyebrow">Account recovery</p>
              <h1 className="card-title">Reset your password</h1>
              <div className="header-rule" />
              <p className="card-sub">Enter your account email and choose a new password below.</p>
            </div>

            {error && (
              <div className="err-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {success ? (
              <div className="success-box">
                <div className="success-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <strong>Password reset successfully!</strong>
                You'll be redirected to the sign-in page in a moment.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field-group">

                  {/* Email */}
                  <div className="field">
                    <label htmlFor="email">Email Address</label>
                    <div className="field-input-wrap">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="john@acme.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* New password */}
                  <div className="field">
                    <label htmlFor="password">New Password</label>
                    <div className="field-input-wrap">
                      <input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className="has-toggle"
                      />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                        {showPw
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>

                    {form.password && (
                      <div className="strength-row">
                        <div className="strength-bars">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColor : undefined }} />
                          ))}
                        </div>
                        <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="field">
                    <label htmlFor="confirm">Confirm Password</label>
                    <div className="field-input-wrap">
                      <input
                        id="confirm"
                        type={showPw ? 'text' : 'password'}
                        name="confirm"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="has-toggle"
                      />
                    </div>
                    {form.confirm && (
                      <div className="match-hint" style={{ color: form.password === form.confirm ? '#1a7a4a' : '#c0392b' }}>
                        {form.password === form.confirm
                          ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> Passwords match</>
                          : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Passwords do not match</>
                        }
                      </div>
                    )}
                  </div>

                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  <span className="btn-inner">
                    {loading && <span className="spinner" />}
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </span>
                </button>
              </form>
            )}

            <p className="back-link">
              Remember your password?{' '}
              <Link to="/login">Back to sign in</Link>
            </p>

            <div className="security-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Secured with 256-bit encryption. We never store your credentials in plaintext.</span>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}