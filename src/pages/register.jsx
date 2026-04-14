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

        .reg-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
        }

        /* ── Left panel ── */
        .reg-left {
          display: none;
          width: 42%;
          background: var(--navy);
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
            radial-gradient(ellipse 70% 55% at 20% 100%, rgba(201,168,76,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 10%,  rgba(201,168,76,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        /* decorative grid lines */
        .reg-left::after {
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
          display: flex; align-items: center; gap: 10px; margin-bottom: 64px;
        }
        .logo-mark {
          width: 36px; height: 36px;
          border: 1.5px solid var(--gold);
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
        .left-headline em { color: var(--gold-l); font-style: italic; }

        .left-sub {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.52);
          font-weight: 300;
          max-width: 320px;
        }

        .left-pills {
          display: flex; flex-direction: column; gap: 12px;
          position: relative; z-index: 1;
        }
        .pill {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 14px 18px;
        }
        .pill-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: rgba(201,168,76,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .pill-icon svg { width: 15px; height: 15px; stroke: var(--gold-l); fill: none; stroke-width: 1.8; }
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
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-header { margin-bottom: 36px; }
        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo .logo-mark { border-color: var(--navy); }
        .mobile-logo .logo-text { color: var(--navy); }

        .card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .card-sub { font-size: 13.5px; color: var(--muted); font-weight: 400; }

        /* divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
          width: 36px;
          margin: 16px 0 28px;
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
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--navy);
          margin-bottom: 7px;
        }

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

        /* checkbox */
        .agree-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 26px;
        }
        .agree-row input[type="checkbox"] {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;
          accent-color: var(--navy); cursor: pointer;
        }
        .agree-row label {
          font-size: 12px; line-height: 1.6;
          color: var(--muted); cursor: pointer;
        }
        .agree-row label a { color: var(--navy); text-decoration: underline; }

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

        .signin-link {
          text-align: center; font-size: 13px; color: var(--muted); margin-top: 22px;
        }
        .signin-link a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="reg-root">

        {/* ── Left decorative panel ── */}
        <aside className="reg-left">
          <div className="left-brand">
            <div className="left-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="logo-text">Pasado</span>
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
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
              {
                label: 'Secure claim submission',
                desc: 'Bank-grade encryption on every transfer',
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
              {
                label: 'Real-time status tracking',
                desc: 'Know exactly where every claim stands',
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
            ].map((p) => (
              <div className="pill" key={p.label}>
                <div className="pill-icon">{p.icon}</div>
                <div>
                  <div className="pill-text" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.88)', marginBottom: 2 }}>{p.label}</div>
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
              {/* shown only on mobile */}
              <div className="mobile-logo">
                <div className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0f1f3d" strokeWidth="1.8" style={{width:18,height:18}}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="logo-text">Pasado</span>
              </div>

              <p style={{fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>
                Get started
              </p>
              <h1 className="card-title">Create your account</h1>
              <div className="divider" />
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
                  I authorize Pasado to submit claims on my behalf to licensed
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

            {/* ── Agency sign-up prompt ── */}
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
    <div className="logo-mark" style={{ flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', margin: '0 0 2px' }}>
        Register your agency
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
        Join our vetted network and receive matched claims.
      </p>
    </div>
    <Link to="/agency/register" style={{
      fontSize: 12, fontWeight: 600, color: 'var(--gold-d)',
      textDecoration: 'underline', textUnderlineOffset: 2, whiteSpace: 'nowrap',
    }}>
      Sign up ›
    </Link>
  </div>
</div>
          </div>
        </main>
      </div>
    </>
  );
}