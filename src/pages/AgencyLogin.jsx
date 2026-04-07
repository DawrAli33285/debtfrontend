import { useState } from 'react';
import { loginAgency } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function AgencyLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAgency({ email: form.email.trim(), password: form.password });
    setLoading(false);
    if (res.token) {
      localStorage.setItem('agencyToken', res.token);
      navigate('/agency/dashboard');
    } else {
      setError(res.message || 'Invalid email or password');
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

        .al-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
        }

        /* ── Left panel ── */
        .al-left {
          display: none;
          width: 42%;
          background: var(--navy);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .al-left { display: flex; } }

        .al-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 80% 100%, rgba(201,168,76,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 10% 10%,  rgba(201,168,76,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .al-left::after {
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
        .left-logo  { display: flex; align-items: center; gap: 10px; margin-bottom: 64px; }
        .logo-mark  {
          width: 36px; height: 36px;
          border: 1.5px solid var(--gold);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 17px; color: #fff; letter-spacing: 0.01em;
        }
        .left-headline {
          font-family: 'Instrument Serif', serif;
          font-size: 36px; line-height: 1.2; color: #fff; margin-bottom: 18px;
        }
        .left-headline em { color: var(--gold-l); font-style: italic; }
        .left-sub {
          font-size: 14px; line-height: 1.7;
          color: rgba(255,255,255,0.52); font-weight: 300; max-width: 320px;
        }

        /* stat cards */
        .stat-cards { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
        .stat-card {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex; align-items: center; gap: 16px;
        }
        .stat-icon {
          width: 38px; height: 38px; flex-shrink: 0;
          background: rgba(201,168,76,0.13);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-icon svg { width: 17px; height: 17px; stroke: var(--gold-l); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .stat-value { font-family: 'Instrument Serif', serif; font-size: 22px; color: #fff; line-height: 1; margin-bottom: 3px; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 400; }

        /* benefit list */
        .benefit-list { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }
        .benefit-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5;
        }
        .benefit-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold); flex-shrink: 0; margin-top: 7px;
        }

        /* ── Right ── */
        .al-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 24px;
        }

        .al-card {
          width: 100%; max-width: 420px;
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

        .card-eyebrow {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--gold-d); margin-bottom: 7px;
        }
        .card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px; color: var(--navy); margin-bottom: 6px;
        }
        .card-sub { font-size: 13.5px; color: var(--muted); }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 36px; margin: 16px 0 28px;
        }

        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc;
          color: var(--error); font-size: 13px;
          padding: 10px 14px; border-radius: 10px; margin-bottom: 20px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 10px; }

        .field label {
          display: block; font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--navy); margin-bottom: 7px;
        }
        .field input {
          width: 100%; border: 1.5px solid var(--border);
          border-radius: 10px; padding: 11px 14px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: var(--navy); background: var(--white);
          transition: border-color 0.18s, box-shadow 0.18s; outline: none;
        }
        .field input::placeholder { color: #bbb; }
        .field input:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(15,31,61,0.07);
        }

        /* forgot link */
        .forgot-row {
          display: flex; justify-content: flex-end; margin-bottom: 24px; margin-top: 6px;
        }
        .forgot-link {
          font-size: 12px; color: var(--gold-d); font-weight: 600;
          text-decoration: underline; text-underline-offset: 2px;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; padding: 0;
        }
        .forgot-link:hover { color: var(--navy); }

        /* submit */
        .btn-submit {
          width: 100%;
          background: var(--navy); color: #fff; border: none;
          border-radius: 10px; padding: 13px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; letter-spacing: 0.03em;
          cursor: pointer; transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          position: relative; overflow: hidden;
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
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* bottom links */
        .signin-link {
          text-align: center; font-size: 13px; color: var(--muted); margin-top: 22px;
        }
        .signin-link a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }

        /* business CTA */
        .biz-cta {
          display: flex; align-items: center; gap: 14px;
          background: var(--cream); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 16px; margin-top: 24px;
        }
        .biz-cta-text { flex: 1; }
        .biz-cta-label { font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 2px; }
        .biz-cta-sub   { font-size: 12px; color: var(--muted); line-height: 1.4; }
        .biz-cta-link  {
          font-size: 12px; font-weight: 600; color: var(--gold-d);
          text-decoration: underline; text-underline-offset: 2px; white-space: nowrap;
        }
        .biz-cta-link:hover { color: var(--navy); }

        .divider-label {
          display: flex; align-items: center; gap: 10px;
          margin: 22px 0 0;
          font-size: 11px; color: var(--muted);
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .divider-label::before, .divider-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
      `}</style>

      <div className="al-root">

        {/* ── Left panel ── */}
        <aside className="al-left">
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
              Welcome back to<br />your <em>agency portal.</em>
            </h2>
            <p className="left-sub">
              Manage your matched claims, track assignments, and grow your recovery pipeline — all in one place.
            </p>
          </div>

          {/* Stat cards */}
          <div className="stat-cards">
            {[
              {
                value: '2,400+',
                label: 'Claims matched monthly',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                ),
              },
              {
                value: '98%',
                label: 'Agency satisfaction rate',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
              },
              {
                value: '$0',
                label: 'No monthly fees or bidding',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
              },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="benefit-list">
            {[
              'Real-time dashboard for every active assignment',
              'Instant notifications when new claims are matched',
              'Secure document exchange with submitting businesses',
            ].map(b => (
              <div className="benefit-item" key={b}>
                <span className="benefit-dot" />
                {b}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel ── */}
        <main className="al-right">
          <div className="al-card">

            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="logo-mark" style={{borderColor:'var(--navy)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{width:18,height:18}}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text" style={{color:'var(--navy)'}}>Collections Connector</span>
            </div>

            <p className="card-eyebrow">Agency Portal</p>
            <h1 className="card-title">Sign in to your agency</h1>
            <div className="divider" />
            <p className="card-sub">Enter your credentials to access your agency dashboard.</p>

            <div style={{marginTop: 28}}>
              {error && <div className="err-box">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="field-group">

                  <div className="field">
                    <label htmlFor="email">Work Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="jane@premierco.com"
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
                      autoComplete="current-password"
                      placeholder="Your password"
                    />
                  </div>

                </div>

                <div className="forgot-row">
                  <button type="button" className="forgot-link">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  <span className="btn-inner">
                    {loading && <span className="spinner" />}
                    {loading ? 'Signing in…' : 'Sign In'}
                  </span>
                </button>
              </form>

              <p className="signin-link" style={{marginTop: 18}}>
                New agency?{' '}
                <Link to="/agency/register">Create an account</Link>
              </p>

              <div className="divider-label">Not an agency?</div>

              <div className="biz-cta">
                <div className="logo-mark" style={{borderColor:'var(--navy)', flexShrink:0}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{width:18,height:18}}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="biz-cta-text">
                  <div className="biz-cta-label">Business sign in</div>
                  <div className="biz-cta-sub">Submit and track claims for your business.</div>
                </div>
                <Link to="/login" className="biz-cta-link">Sign in ›</Link>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}