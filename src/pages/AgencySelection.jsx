import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaims, createAssignment } from '../api/auth';

export default function AgencySelection() {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const agency      = state?.agency;
  const [claims, setClaims]               = useState([]);
  const [selectedClaim, setSelectedClaim] = useState('');
  const [method, setMethod]               = useState('manual');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    if (!agency) { navigate('/agencies'); return; }
    (async () => {
      try {
        const res = await getClaims();
        setClaims(res.claims.filter(c => c.status === 'submitted'));
      } catch (err) { console.error(err); }
    })();
  }, [agency, navigate]);

  const handleSubmit = async () => {
    if (!selectedClaim) { setError('Please select a claim'); return; }
    setLoading(true); setError('');
    try {
      const res = await createAssignment({ claim_id: selectedClaim, agency_id: agency._id, method });
      if (res.message === 'Claim assigned successfully') {
        navigate('/assignments/confirm', { state: { agency, claim_id: selectedClaim, method } });
      } else {
        setError(res.message || 'Assignment failed');
      }
    } catch { setError('Assignment failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (!agency) return null;

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

        .as-root {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--off-white);
        }

        /* ── Left panel ── */
        .as-left {
          display: none;
          width: 42%;
          background: var(--blue);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .as-left { display: flex; } }

        .as-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 20% 100%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 10%,  rgba(255,255,255,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .as-left::after {
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

        /* Steps */
        .steps-list { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0; }
        .step-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .step-item:last-child { border-bottom: none; }
        .step-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9);
          flex-shrink: 0; margin-top: 1px;
        }
        .step-text { flex: 1; }
        .step-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .step-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; }

        /* Pills */
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
        .pill-icon svg { width: 15px; height: 15px; stroke: #fff; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .pill-text { font-size: 13px; color: rgba(255,255,255,0.72); font-weight: 400; line-height: 1.4; }

        /* ── Right panel ── */
        .as-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 24px;
        }

        .as-card {
          width: 100%; max-width: 420px;
          animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile logo */
        .mobile-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .logo-mark-blue {
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
        .card-sub { font-size: 13.5px; color: var(--text-muted); margin-bottom: 28px; }

        /* Summary card */
        .summary-card {
          background: var(--blue);
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .summary-card::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .summary-row {
          display: flex; justify-content: space-between; align-items: center;
          position: relative; z-index: 1;
        }
        .summary-row + .summary-row {
          margin-top: 10px; padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .summary-label { font-size: 11.5px; color: rgba(255,255,255,0.5); font-weight: 500; }
        .summary-value { font-size: 13px; color: #fff; font-weight: 600; }

        /* Form */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px; }
        .field label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 7px;
        }
        .field select {
          width: 100%; border: 1.5px solid var(--border);
          border-radius: 8px; padding: 11px 14px;
          font-size: 14px; font-family: inherit;
          color: var(--text); background: var(--white);
          transition: border-color 0.18s, box-shadow 0.18s; outline: none;
          cursor: pointer;
        }
        .field select:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(22,105,169,0.1);
        }

        .method-group { display: flex; gap: 10px; }
        .method-btn {
          flex: 1; padding: 10px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          border: 1.5px solid var(--border); background: var(--white);
          color: var(--text-muted); transition: all 0.15s;
          font-family: inherit;
        }
        .method-btn:hover { border-color: var(--blue); color: var(--text); }
        .method-btn-active { background: var(--blue); color: #fff; border-color: var(--blue); }

        .no-claims { font-size: 13px; color: var(--error); padding: 8px 0; }

        .err-box {
          background: #fdf0ef; border: 1px solid #f1c0bc;
          color: var(--error); font-size: 13px; padding: 10px 14px;
          border-radius: 8px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }

        .btn-submit {
          width: 100%; background: var(--blue); color: #fff; border: none;
          border-radius: 8px; padding: 13px; font-size: 14px;
          font-family: inherit; font-weight: 600;
          letter-spacing: 0.03em; cursor: pointer;
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
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          text-align: center; font-size: 13px; color: var(--text-muted);
        }
        .back-link a { color: var(--blue); font-weight: 600; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }

        .security-note {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 28px; padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .security-note svg { flex-shrink: 0; }
        .security-note span { font-size: 11.5px; color: #bbb; line-height: 1.4; }

        @media (max-width: 600px) {
          .as-right { padding: 32px 16px; }
        }
      `}</style>

      <div className="as-root">

        {/* ── Left panel ── */}
        <aside className="as-left">
          <div className="left-brand">
           
            <h2 className="left-headline">
              Assign a claim<br />to an <em>agency.</em>
            </h2>
            <p className="left-sub">
              Select an unassigned claim and route it to {agency.name}. Assignments are tracked and can be reviewed at any time.
            </p>
          </div>

          <div className="steps-list">
            {[
              { n: '1', t: 'Choose your agency', d: 'You\'ve selected ' + agency.name + ' with a ' + agency.fee_percentage + '% recovery fee.' },
              { n: '2', t: 'Select a submitted claim', d: 'Only claims with a submitted status are eligible for assignment.' },
              { n: '3', t: 'Confirm the assignment', d: 'Review and confirm — the agency will be notified immediately.' },
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

          <div className="left-pills">
            {[
              {
                label: 'Capacity tracked automatically',
                desc: agency.claims_used + ' of ' + agency.claim_limit + ' slots used',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: 'Full assignment history',
                desc: 'Review all assignments in your dashboard',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
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

        {/* ── Right panel ── */}
        <main className="as-right">
          <div className="as-card">

            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="logo-mark-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.01em' }}>Collection Connector</span>
            </div>

            <p className="card-eyebrow">Claim assignment</p>
            <h1 className="card-title">Assign a claim</h1>
            <div className="header-rule" />
            <p className="card-sub">Assigning to <strong>{agency.name}</strong> — review agency details below before confirming.</p>

            {/* Agency summary */}
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">Agency</span>
                <span className="summary-value">{agency.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Recovery Fee</span>
                <span className="summary-value">{agency.fee_percentage}%</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Capacity</span>
                <span className="summary-value">{agency.claims_used} / {agency.claim_limit}</span>
              </div>
            </div>

            {/* Form fields */}
            <div className="field-group">
              <div className="field">
                <label>Select Claim</label>
                {claims.length === 0
                  ? <p className="no-claims">No unassigned claims found.</p>
                  : (
                    <select value={selectedClaim} onChange={e => setSelectedClaim(e.target.value)}>
                      <option value="">— Select a claim —</option>
                      {claims.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.debtor_name} — ${c.amount} ({c.debtor_type})
                        </option>
                      ))}
                    </select>
                  )
                }
              </div>

            
            </div>

            {error && (
              <div className="err-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading || claims.length === 0} className="btn-submit">
              <span className="btn-inner">
                {loading && <span className="spinner" />}
                {loading ? 'Assigning…' : 'Confirm Assignment →'}
              </span>
            </button>

            <p className="back-link">
              Wrong agency?{' '}
              <Link to="/agencies">Back to agencies</Link>
            </p>

            <div className="security-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>All assignments are logged and auditable. Actions cannot be undone without admin approval.</span>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}