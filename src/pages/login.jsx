import { useState } from 'react';
import { loginUser } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await loginUser({ ...form, role: 'user' });
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed');
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
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --error:  #c0392b;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
        }

        /* ── Left panel ── */
        .login-left {
          display: none;
          width: 42%;
          background: var(--navy);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .login-left { display: flex; } }

        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 80% 100%, rgba(201,168,76,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 10% 10%,  rgba(201,168,76,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-left::after {
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
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          font-weight: 300;
          max-width: 300px;
        }

        /* stat cards */
        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .stat-card {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .stat-card:first-child { grid-column: span 2; }
        .stat-value {
          font-family: 'Instrument Serif', serif;
          font-size: 30px;
          color: var(--gold-l);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 12.5px;
          color: rgba(255,255,255,0.5);
          font-weight: 400;
          line-height: 1.4;
        }

        /* ── Right panel ── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* mobile logo */
        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo .logo-mark { border-color: var(--navy); }
        .mobile-logo .logo-text { color: var(--navy); }

        .card-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }
        .card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 36px;
          margin: 16px 0 10px;
        }
        .card-sub {
          font-size: 13.5px;
          color: var(--muted);
          font-weight: 400;
          margin-bottom: 32px;
        }

        /* error */
        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px; }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--navy);
          margin-bottom: 7px;
        }
        .field-input-wrap { position: relative; }
        .field input {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--navy);
          background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .field input::placeholder { color: #bbb; }
        .field input:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(15,31,61,0.07);
        }

        .field-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .field-meta label {
          margin-bottom: 0;
        }
        .forgot-link {
          font-size: 12px;
          color: var(--muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: var(--navy); }

        /* submit */
        .btn-submit {
          width: 100%;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .btn-submit::after {
          content: '';
          position: absolute;
          inset: 0;
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
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .register-link {
          text-align: center;
          font-size: 13px;
          color: var(--muted);
        }
        .register-link a {
          color: var(--navy);
          font-weight: 600;
          text-decoration: none;
        }
        .register-link a:hover { text-decoration: underline; }

        /* security note */
        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .security-note svg { flex-shrink: 0; }
        .security-note span {
          font-size: 11.5px;
          color: #bbb;
          line-height: 1.4;
        }
      `}</style>

      <div className="login-root">

        {/* ── Left panel ── */}
        <aside className="login-left">
          <div className="left-brand">
            <div className="left-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" style={{width:18,height:18}}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text">Collections Connector</span>
            </div>

            <h2 className="left-headline">
              Welcome<br />back to your<br /><em>command centre.</em>
            </h2>
            <p className="left-sub">
              Track claims, monitor agency activity, and manage your entire recovery pipeline from one place.
            </p>
          </div>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value">98.4%</div>
              <div className="stat-label">Claim acknowledgement rate within 24 hours across our agency network</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">340+</div>
              <div className="stat-label">Licensed agencies connected</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">SOC 2</div>
              <div className="stat-label">Type II certified platform</div>
            </div>
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="login-right">
          <div className="login-card">

            <div className="mobile-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{width:18,height:18}}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text" style={{color:'var(--navy)'}}>Collections Connector</span>
            </div>

            <p className="card-eyebrow">Welcome back</p>
            <h1 className="card-title">Sign in to your account</h1>
            <div className="divider" />
            <p className="card-sub">Enter your credentials to access your dashboard.</p>

            {error && (
              <div className="err-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
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

                <div className="field">
                  <div className="field-meta">
                    <label htmlFor="password">Password</label>
                    <a href="#" className="forgot-link">Forgot password?</a>
                  </div>
                  <div className="field-input-wrap">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <span className="btn-inner">
                  {loading && <span className="spinner" />}
                  {loading ? 'Signing in…' : 'Sign In'}
                </span>
              </button>
            </form>

            <p className="register-link">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
            <div style={{ margin: '24px 0 0' }}>
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    margin: '0 0 12px',
    fontSize: 11, color: 'var(--muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
  }}>
    <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    Are you a collection agency?
    <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>

  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'var(--cream)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 16px',
  }}>
    <div className="logo-mark" style={{ borderColor: 'var(--navy)', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', margin: '0 0 2px' }}>
        Agency sign in
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
        Access your agency portal and manage assigned claims.
      </p>
    </div>
    <Link to="/agency/login" style={{
      fontSize: 12, fontWeight: 600, color: 'var(--gold-d)',
      textDecoration: 'underline', textUnderlineOffset: 2, whiteSpace: 'nowrap',
    }}>
      Sign in ›
    </Link>
  </div>
</div>

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