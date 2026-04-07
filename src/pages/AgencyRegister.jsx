import { useState } from 'react';
import { registerAgency } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const SPECIALTIES = [
  'Medical Debt',
  'Commercial B2B',
  'Consumer Debt',
  'Student Loans',
  'Auto Loans',
  'Credit Cards',
  'Utilities',
  'Legal Judgments',
];

export default function AgencyRegister() {
  const navigate = useNavigate();

  const [step, setStep]     = useState(1); // 1 = agency info, 2 = owner login
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — Agency profile
  const [agency, setAgency] = useState({
    agency_name:    '',
    fee_percentage: '',
    states_covered: [],
    specialties:    [],
  });

  // Step 2 — Owner account
  const [owner, setOwner] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
  });

  const [agreed, setAgreed] = useState(false);

  /* ── helpers ── */
  const toggleState = (s) =>
    setAgency(prev => ({
      ...prev,
      states_covered: prev.states_covered.includes(s)
        ? prev.states_covered.filter(x => x !== s)
        : [...prev.states_covered, s],
    }));

  const toggleSpecialty = (s) =>
    setAgency(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s],
    }));

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (!agency.agency_name.trim()) return setError('Agency name is required');
    if (agency.states_covered.length === 0) return setError('Select at least one state');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (owner.password !== owner.confirm) return setError('Passwords do not match');
    if (owner.password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    const res = await registerAgency({
      agency_name:    agency.agency_name.trim(),
      fee_percentage: parseFloat(agency.fee_percentage) || 0,
      states_covered: agency.states_covered,
      specialties:    agency.specialties,
      name:           owner.name.trim(),
      email:          owner.email.trim(),
      password:       owner.password,
    });
    setLoading(false);

    if (res.token) {
      localStorage.setItem('agencyToken', res.token);
      navigate('/agency/dashboard');
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
          --gold-d: #a8883a;
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --white:  #ffffff;
          --error:  #c0392b;
        }

        .ar-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
        }

        /* ── Left panel ── */
        .ar-left {
          display: none;
          width: 42%;
          background: var(--navy);
          padding: 56px 52px;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .ar-left { display: flex; } }

        .ar-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 80% 100%, rgba(201,168,76,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 10% 10%,  rgba(201,168,76,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .ar-left::after {
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

        /* step tracker on left */
        .step-track { position: relative; z-index: 1; }
        .step-track-title {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 20px;
        }
        .step-item {
          display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
        }
        .step-circle {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          transition: all 0.3s;
        }
        .step-circle.active   { background: var(--gold); color: var(--navy); }
        .step-circle.done     { background: rgba(201,168,76,0.2); color: var(--gold-l); border: 1.5px solid var(--gold-d); }
        .step-circle.inactive { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); }
        .step-label { font-size: 13.5px; color: rgba(255,255,255,0.55); }
        .step-label.active { color: #fff; font-weight: 500; }

        /* benefits list */
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
        .ar-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 24px;
        }

        .ar-card {
          width: 100%; max-width: 480px;
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

        /* step indicator (mobile) */
        .mobile-steps {
          display: flex; align-items: center; gap: 8px; margin-bottom: 28px;
        }
        @media (min-width: 900px) { .mobile-steps { display: none; } }
        .ms-dot {
          height: 3px; border-radius: 99px;
          transition: all 0.3s;
          background: var(--border);
          flex: 1;
        }
        .ms-dot.active { background: var(--navy); }
        .ms-dot.done   { background: var(--gold); }

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
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
        .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

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
        .field-hint {
          font-size: 11.5px; color: var(--muted); margin-top: 5px;
        }

        /* input with suffix */
        .input-suffix-wrap {
          position: relative;
        }
        .input-suffix-wrap input { padding-right: 36px; }
        .input-suffix {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px; color: var(--muted); pointer-events: none;
        }

        /* tag pickers */
        .tag-label {
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--navy); margin-bottom: 10px;
        }
        .tag-grid {
          display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 4px;
        }
        .tag {
          padding: 5px 11px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
          border: 1.5px solid var(--border);
          background: var(--white); color: var(--muted);
          cursor: pointer; transition: all 0.14s; user-select: none;
        }
        .tag:hover   { border-color: rgba(201,168,76,0.4); color: var(--navy); }
        .tag.selected {
          background: var(--navy); border-color: var(--navy);
          color: var(--white);
        }

        /* states grid — more compact */
        .states-grid {
          display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px;
          margin-bottom: 4px;
        }
        @media (max-width: 480px) { .states-grid { grid-template-columns: repeat(6, 1fr); } }
        .state-btn {
          padding: 5px 0; border-radius: 7px; text-align: center;
          font-size: 11px; font-weight: 600;
          border: 1.5px solid var(--border);
          background: var(--white); color: var(--muted);
          cursor: pointer; transition: all 0.12s; user-select: none;
        }
        .state-btn:hover   { border-color: rgba(201,168,76,0.45); color: var(--navy); }
        .state-btn.selected { background: var(--navy); border-color: var(--navy); color: var(--white); }

        .select-all-btn {
          font-size: 11.5px; font-weight: 600; color: var(--gold-d);
          background: none; border: none; cursor: pointer;
          padding: 0; text-decoration: underline; text-underline-offset: 2px;
          margin-bottom: 8px;
        }
        .select-all-btn:hover { color: var(--navy); }

        /* agree row */
        .agree-row {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 26px;
        }
        .agree-row input[type="checkbox"] {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;
          accent-color: var(--navy); cursor: pointer;
        }
        .agree-row label { font-size: 12px; line-height: 1.6; color: var(--muted); cursor: pointer; }
        .agree-row label a { color: var(--navy); text-decoration: underline; }

        /* buttons */
        .btn-row { display: flex; gap: 10px; }
        .btn-back {
          flex: 0 0 auto;
          background: transparent; border: 1.5px solid var(--border);
          border-radius: 10px; padding: 12px 18px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; color: var(--muted);
          cursor: pointer; transition: border-color 0.15s, color 0.15s;
        }
        .btn-back:hover { border-color: var(--navy); color: var(--navy); }

        .btn-submit {
          flex: 1;
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

        .signin-link {
          text-align: center; font-size: 13px; color: var(--muted); margin-top: 22px;
        }
        .signin-link a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="ar-root">

        {/* ── Left panel ── */}
        <aside className="ar-left">
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
              Grow your agency<br />with <em>qualified claims.</em>
            </h2>
            <p className="left-sub">
              Join our verified network and receive matched debt recovery cases directly — no cold outreach, no bidding wars.
            </p>
          </div>

          {/* Step tracker */}
          <div className="step-track">
            <p className="step-track-title">Registration Steps</p>
            {[
              { n: 1, label: 'Agency Profile' },
              { n: 2, label: 'Owner Account'  },
            ].map(({ n, label }) => (
              <div className="step-item" key={n}>
                <div className={`step-circle ${step === n ? 'active' : step > n ? 'done' : 'inactive'}`}>
                  {step > n
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : n
                  }
                </div>
                <span className={`step-label ${step === n ? 'active' : ''}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="benefit-list">
            {[
              'Receive pre-qualified, matched claims automatically',
              'Dashboard to track every assignment in real time',
              'Transparent fee structure — no hidden costs',
              'Verified badge builds client trust instantly',
            ].map(b => (
              <div className="benefit-item" key={b}>
                <span className="benefit-dot" />
                {b}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel ── */}
        <main className="ar-right">
          <div className="ar-card">

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

            {/* Mobile step dots */}
            <div className="mobile-steps">
              {[1, 2].map(n => (
                <div key={n} className={`ms-dot ${step === n ? 'active' : step > n ? 'done' : ''}`} />
              ))}
            </div>

            {/* Header */}
            <p className="card-eyebrow">
              Step {step} of 2 — {step === 1 ? 'Agency Profile' : 'Owner Account'}
            </p>
            <h1 className="card-title">
              {step === 1 ? 'Register your agency' : 'Create your login'}
            </h1>
            <div className="divider" />
            <p className="card-sub">
              {step === 1
                ? 'Tell us about your agency so we can match you with the right claims.'
                : 'Set up the owner account you\'ll use to access the agency dashboard.'
              }
            </p>

            <div style={{marginTop: 28}}>
              {error && <div className="err-box">{error}</div>}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={handleStep1}>
                  <div className="field-group">

                    <div className="field">
                      <label htmlFor="agency_name">Agency Name</label>
                      <input
                        id="agency_name"
                        type="text"
                        value={agency.agency_name}
                        onChange={e => setAgency({...agency, agency_name: e.target.value})}
                        required
                        placeholder="Premier Collections LLC"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="fee_pct">Collection Fee (%)</label>
                      <div className="input-suffix-wrap">
                        <input
                          id="fee_pct"
                          type="number"
                          min="0" max="50" step="0.1"
                          value={agency.fee_percentage}
                          onChange={e => setAgency({...agency, fee_percentage: e.target.value})}
                          placeholder="25"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                      <p className="field-hint">Your standard contingency rate (can be updated later)</p>
                    </div>

                    {/* Specialties */}
                    <div>
                      <p className="tag-label">Specialties</p>
                      <div className="tag-grid">
                        {SPECIALTIES.map(s => (
                          <div
                            key={s}
                            className={`tag${agency.specialties.includes(s) ? ' selected' : ''}`}
                            onClick={() => toggleSpecialty(s)}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* States */}
                    <div>
                      <p className="tag-label">
                        States Covered
                        <span style={{color:'var(--error)', marginLeft:4}}>*</span>
                      </p>
                      <button
                        type="button"
                        className="select-all-btn"
                        onClick={() =>
                          setAgency(prev => ({
                            ...prev,
                            states_covered: prev.states_covered.length === US_STATES.length
                              ? []
                              : [...US_STATES],
                          }))
                        }
                      >
                        {agency.states_covered.length === US_STATES.length ? 'Deselect all' : 'Select all'}
                      </button>
                      <div className="states-grid">
                        {US_STATES.map(s => (
                          <div
                            key={s}
                            className={`state-btn${agency.states_covered.includes(s) ? ' selected' : ''}`}
                            onClick={() => toggleState(s)}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                      <p className="field-hint">
                        {agency.states_covered.length === 0
                          ? 'Select all states where your agency is licensed to operate'
                          : `${agency.states_covered.length} state${agency.states_covered.length !== 1 ? 's' : ''} selected`
                        }
                      </p>
                    </div>

                  </div>

                  <button type="submit" className="btn-submit">
                    <span className="btn-inner">
                      Continue
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  </button>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="field-group">

                    <div className="field">
                      <label htmlFor="owner_name">Your Full Name</label>
                      <input
                        id="owner_name"
                        type="text"
                        value={owner.name}
                        onChange={e => setOwner({...owner, name: e.target.value})}
                        required
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="owner_email">Work Email</label>
                      <input
                        id="owner_email"
                        type="email"
                        value={owner.email}
                        onChange={e => setOwner({...owner, email: e.target.value})}
                        required
                        placeholder="jane@premierco.com"
                      />
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="owner_pass">Password</label>
                        <input
                          id="owner_pass"
                          type="password"
                          value={owner.password}
                          onChange={e => setOwner({...owner, password: e.target.value})}
                          required
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="owner_confirm">Confirm Password</label>
                        <input
                          id="owner_confirm"
                          type="password"
                          value={owner.confirm}
                          onChange={e => setOwner({...owner, confirm: e.target.value})}
                          required
                          placeholder="Repeat password"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="agree-row">
                    <input
                      type="checkbox"
                      id="agency_agree"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      required
                    />
                    <label htmlFor="agency_agree">
                      I confirm this agency is licensed to operate in the selected states
                      and agree to the{' '}
                      <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
                    </label>
                  </div>

                  <div className="btn-row">
                    <button type="button" className="btn-back" onClick={() => { setStep(1); setError(''); }}>
                      ← Back
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading || !agreed}>
                      <span className="btn-inner">
                        {loading && <span className="spinner" />}
                        {loading ? 'Creating account…' : 'Create Agency Account'}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              <p className="signin-link">
                Already have an agency account?{' '}
                <Link to="/agency/login">Sign in</Link>
                {' · '}
                <Link to="/register">Business sign up</Link>
              </p>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}