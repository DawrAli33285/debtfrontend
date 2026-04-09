import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaimById } from '../api/auth';

export default function AssignmentConfirmation() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [claim, setClaim] = useState(null);
  const agency = state?.agency;
  const method = state?.method;

  useEffect(() => {
    if (!state?.claim_id) { navigate('/agencies'); return; }
    (async () => {
      try {
        const res = await getClaimById(state.claim_id);
        setClaim(res.claim);
      } catch (err) { console.error(err); }
    })();
  }, [state, navigate]);

  if (!claim || !agency) return null;

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

        .success-hero { display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:36px; }
        .success-ring {
          width:68px; height:68px; border-radius:50%;
          border:1.5px solid rgba(201,168,76,0.3);
          background:rgba(201,168,76,0.08);
          display:flex; align-items:center; justify-content:center; margin-bottom:16px;
        }
        .success-title { font-family:'Instrument Serif',serif; font-size:30px; color:var(--navy); }
        .success-title em { color:var(--gold); font-style:italic; }
        .success-sub { font-size:13.5px; color:var(--muted); margin-top:6px; }

        .summary-card {
          background:var(--white); border-radius:18px;
          border:1px solid var(--border);
          box-shadow:0 2px 16px rgba(15,31,61,0.045);
          overflow:hidden; margin-bottom:20px;
        }
        .summary-head {
          background:var(--navy); padding:14px 20px;
          position:relative; overflow:hidden;
        }
        .summary-head::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:32px 32px; pointer-events:none;
        }
        .summary-head-title { font-family:'Instrument Serif',serif; font-size:16px; color:#fff; position:relative; z-index:1; }

        .summary-body { padding:20px; display:flex; flex-direction:column; gap:12px; }
        .summary-row { display:flex; justify-content:space-between; align-items:center; font-size:13.5px; }
        .summary-label { color:var(--muted); }
        .summary-value { font-weight:600; color:var(--navy); }
        .summary-divider { height:1px; background:var(--border); }

        .status-chip { background:#eaf2ff; color:#1a5276; border:1px solid #aed6f1; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .fee-value { color:var(--gold-d); font-weight:700; }

        .actions { display:flex; gap:10px; }
        .btn-outline {
          flex:1; padding:11px; border-radius:10px;
          border:1px solid var(--border); background:var(--white);
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:var(--navy); cursor:pointer; transition:border-color 0.15s;
        }
        .btn-outline:hover { border-color:var(--gold); }
        .btn-primary {
          flex:1; padding:11px; border-radius:10px;
          border:none; background:var(--navy); color:#fff;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:background 0.15s;
        }
        .btn-primary:hover { background:var(--navy-2); }

        .footer-note { text-align:center; margin-top:32px; font-size:11.5px; color:#bbb; line-height:1.6; }
      `}</style>

      <nav className="navbar">
        
        <Link to="/dashboard" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="page">
        <div className="success-hero">
          <div className="success-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="success-title">Claim <em>Assigned!</em></h1>
          <p className="success-sub">Your claim has been successfully assigned to the agency</p>
        </div>

        <div className="summary-card">
          <div className="summary-head">
            <p className="summary-head-title">Assignment Summary</p>
          </div>
          <div className="summary-body">
            <div className="summary-row">
              <span className="summary-label">Debtor</span>
              <span className="summary-value">{claim.debtor_name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Claim Amount</span>
              <span className="summary-value">${Number(claim.amount).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Agency</span>
              <span className="summary-value">{agency.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Agency Fee</span>
              <span className="summary-value">{agency.fee_percentage}% on recovery</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Method</span>
              <span className="summary-value" style={{textTransform:'capitalize'}}>{method}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className="status-chip">Assigned</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row">
              <span className="summary-label">Platform Referral Fee (7%)</span>
              <span className="fee-value">${(claim.amount * 0.07).toFixed(2)} on recovery</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/claims')} className="btn-outline">View My Claims</button>
          <button onClick={() => navigate('/agencies')} className="btn-primary">Assign Another →</button>
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