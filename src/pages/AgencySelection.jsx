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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --navy:#0f1f3d; --navy-2:#162847; --gold:#c9a84c; --gold-l:#e2c97e;
          --gold-d:#a8883a; --cream:#faf8f4; --muted:#8a95a3; --border:#e4e2dd; --white:#ffffff;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--navy); }

        .navbar {
          background:var(--navy); border-bottom:1px solid rgba(201,168,76,0.15);
          padding:0 40px; height:64px;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:100;
        }
        .navbar::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .nav-brand { display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
        .logo-mark { width:32px; height:32px; border:1.5px solid var(--gold); border-radius:7px; display:flex; align-items:center; justify-content:center; }
        .logo-text { font-family:'Instrument Serif',serif; font-size:16px; color:#fff; }
        .back-link {
          position:relative; z-index:1;
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.5);
          text-decoration:none; border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; padding:7px 14px; transition:color 0.15s,border-color 0.15s;
        }
        .back-link:hover { color:#fff; border-color:rgba(255,255,255,0.28); }

        .page { max-width:560px; margin:0 auto; padding:48px 32px 80px; animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:600px){ .page{padding:32px 16px 60px;} .navbar{padding:0 16px;} }

        .page-eyebrow { font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold-d); margin-bottom:6px; }
        .page-title { font-family:'Instrument Serif',serif; font-size:34px; color:var(--navy); line-height:1.1; }
        .page-title em { color:var(--gold); font-style:italic; }
        .header-divider { height:1px; background:linear-gradient(90deg,var(--gold) 0%,transparent 100%); width:40px; margin:12px 0 8px; }
        .page-sub { font-size:13.5px; color:var(--muted); }

        .summary-card {
          background:var(--navy); border-radius:14px;
          padding:20px; margin:28px 0;
          position:relative; overflow:hidden;
        }
        .summary-card::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:32px 32px; pointer-events:none;
        }
        .summary-row { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
        .summary-row + .summary-row { margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.07); }
        .summary-label { font-size:11.5px; color:rgba(255,255,255,0.45); font-weight:500; }
        .summary-value { font-size:13px; color:#fff; font-weight:600; }

        .form-section { margin-bottom:20px; }
        .form-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; display:block; }

        .form-select {
          width:100%; padding:11px 14px;
          border:1px solid var(--border); border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--navy);
          background:var(--white); outline:none; cursor:pointer;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .form-select:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,0.12); }

        .method-group { display:flex; gap:10px; }
        .method-btn {
          flex:1; padding:10px; border-radius:10px;
          font-size:13px; font-weight:600; cursor:pointer;
          border:1px solid var(--border); background:var(--white);
          color:var(--muted); transition:all 0.15s;
        }
        .method-btn:hover { border-color:var(--gold); color:var(--navy); }
        .method-btn-active { background:var(--navy); color:#fff; border-color:var(--navy); }

        .error-box {
          background:#fdf0ef; border:1px solid #f1c0bc; color:#c0392b;
          font-size:13px; padding:10px 14px; border-radius:10px;
          display:flex; align-items:center; gap:8px; margin-bottom:16px;
        }
        .no-claims { font-size:13px; color:#c0392b; padding:10px 0; }

        .submit-btn {
          width:100%; padding:13px; border-radius:12px;
          background:var(--navy); color:#fff;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
          border:none; cursor:pointer; transition:background 0.15s, opacity 0.15s;
        }
        .submit-btn:hover:not(:disabled) { background:var(--navy-2); }
        .submit-btn:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

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
        <Link to="/agencies" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Agencies
        </Link>
      </nav>

      <div className="page">
        <p className="page-eyebrow">Assignment</p>
        <h1 className="page-title">Assign a <em>Claim</em></h1>
        <div className="header-divider" />
        <p className="page-sub">Assigning to <strong>{agency.name}</strong></p>

        {/* Agency Summary */}
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

        {/* Select Claim */}
        <div className="form-section">
          <label className="form-label">Select Claim</label>
          {claims.length === 0
            ? <p className="no-claims">No unassigned claims found.</p>
            : (
              <select value={selectedClaim} onChange={e => setSelectedClaim(e.target.value)} className="form-select">
                <option value="">-- Select a claim --</option>
                {claims.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.debtor_name} — ${c.amount} ({c.debtor_type})
                  </option>
                ))}
              </select>
            )
          }
        </div>

        {/* Method */}
        <div className="form-section">
          <label className="form-label">Assignment Method</label>
          <div className="method-group">
            {['manual','auto'].map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`method-btn ${method === m ? 'method-btn-active' : ''}`}
              >
                {m === 'auto' ? '⚡ Auto' : '✋ Manual'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || claims.length === 0} className="submit-btn">
          {loading ? 'Assigning…' : 'Confirm Assignment →'}
        </button>
      </div>
    </>
  );
}