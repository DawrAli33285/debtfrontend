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

  // password strength
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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:   #0f1f3d;
          --navy-2: #162847;
          --gold:   #c9a84c;
          --gold-l: #e2c97e;
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --error:  #c0392b;
          --success:#1a7a4a;
        }

        .rp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
        }

        /* ── Left panel ── */
        .rp-left {
          display: none;
          width: 42%;
          background: var(--navy);
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
            radial-gradient(ellipse 70% 55% at 80% 100%, rgba(201,168,76,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 10% 10%,  rgba(201,168,76,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .rp-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .left-brand { position: relative; z-index: 1; }

        .left-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 72px;
        }
        .logo-mark {
          width: 36px; height: 36px;
          border: 1.5px solid var(--gold);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
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
        .left-headline em { color: var(--gold-l); font-style: italic; }
        .left-sub {
          font-size: 14px; line-height: 1.7;
          color: rgba(255,255,255,0.5); font-weight: 300; max-width: 300px;
        }

        /* steps */
        .steps-list { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0; }
        .step-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .step-item:last-child { border-bottom: none; }
        .step-num {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: var(--gold-l);
          flex-shrink: 0; margin-top: 1px;
        }
        .step-text { flex: 1; }
        .step-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .step-desc { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

        /* ── Right panel ── */
        .rp-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 24px;
        }

        .rp-card {
          width: 100%; max-width: 420px;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }

        .card-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 8px;
        }
        .card-title {
          font-family: 'Instrument Serif', serif; font-size: 28px;
          color: var(--navy); margin-bottom: 6px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 36px; margin: 16px 0 10px;
        }
        .card-sub {
          font-size: 13.5px; color: var(--muted); font-weight: 400; margin-bottom: 32px;
        }

        /* notification boxes */
        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc;
          color: var(--error); font-size: 13px; padding: 10px 14px;
          border-radius: 10px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .success-box {
          background: #edfaf4; border: 1px solid #a8e0c1;
          color: var(--success); font-size: 13.5px; padding: 16px 18px;
          border-radius: 12px; text-align: center; line-height: 1.6;
        }
        .success-box strong { display: block; font-size: 15px; margin-bottom: 4px; }
        .success-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: #d4f4e4; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 12px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px; }
        .field label {
          display: block; font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--navy); margin-bottom: 7px;
        }
        .field-input-wrap { position: relative; }
        .field input {
          width: 100%; border: 1.5px solid var(--border);
          border-radius: 10px; padding: 11px 14px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: var(--navy); background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s; outline: none;
        }
        .field input::placeholder { color: #bbb; }
        .field input:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(15,31,61,0.07);
        }
        .pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--muted); padding: 4px; display: flex; align-items: center;
          transition: color 0.15s;
        }
        .pw-toggle:hover { color: var(--navy); }
        .field input.has-toggle { padding-right: 40px; }

        /* strength bar */
        .strength-row {
          display: flex; align-items: center; gap: 8px; margin-top: 8px;
        }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          background: var(--border); transition: background 0.3s;
        }
        .strength-label { font-size: 11px; font-weight: 600; min-width: 36px; text-align: right; }

        /* match indicator */
        .match-hint {
          font-size: 11.5px; margin-top: 6px; display: flex;
          align-items: center; gap: 5px;
        }

        /* submit */
        .btn-submit {
          width: 100%; background: var(--navy); color: #fff; border: none;
          border-radius: 10px; padding: 13px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          letter-spacing: 0.03em; cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          position: relative; overflow: hidden; margin-bottom: 20px;
        }
        .btn-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn-submit:hover:not(:disabled) {
          background: var(--navy-2);
          box-shadow: 0 4px 16px rgba(15,31,61,0.22);
          transform: translateY(-1px);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          text-align: center; font-size: 13px; color: var(--muted);
        }
        .back-link a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }

        .security-note {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 28px; padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .security-note svg { flex-shrink: 0; }
        .security-note span { font-size: 11.5px; color: #bbb; line-height: 1.4; }
      `}</style>

      <div className="rp-root">

        {/* ── Left panel ── */}
        <aside className="rp-left">
          <div className="left-brand">
            <div className="left-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" style={{width:18,height:18}}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text">Pasado</span>
            </div>

            <h2 className="left-headline">
              Reset your<br /><em>password</em><br />securely.
            </h2>
            <p className="left-sub">
              Follow the steps on the right to regain access to your account. Your data remains safe throughout the process.
            </p>
          </div>

          <div className="steps-list">
            {[
              { n: '1', t: 'Enter your email', d: 'Provide the email address linked to your Pasado account.' },
              { n: '2', t: 'Set a new password', d: 'Choose a strong password that you haven\'t used before.' },
              { n: '3', t: 'Sign back in', d: 'Use your new credentials to access your dashboard.' },
            ].map(s => (
              <div className="step-item" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-text">
                  <div className="step-title">{s.t}</div>
                  <div className="step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="rp-right">
          <div className="rp-card">

            <div className="mobile-logo">
              <div className="logo-mark" style={{borderColor:'var(--navy)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{width:18,height:18}}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text" style={{color:'var(--navy)'}}>Pasado</span>
            </div>

            <p className="card-eyebrow">Account recovery</p>
            <h1 className="card-title">Reset your password</h1>
            <div className="divider" />
            <p className="card-sub">Enter your account email and choose a new password below.</p>

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
                        placeholder="••••••••"
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

                    {/* Strength meter */}
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