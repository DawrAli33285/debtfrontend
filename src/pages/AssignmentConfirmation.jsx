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
          --blue:#1669A9; --blue-dark:#0f5189; --blue-light:#e8f2fa; --blue-mid:#c5ddf0;
          --white:#ffffff; --off-white:#f5f7fa; --border:#e0e7ef;
          --text:#1a2a3a; --text-mid:#4a6070; --text-muted:#7a96a8;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--off-white); color:var(--text); }

        .navbar {
          background:var(--blue); border-bottom:1px solid rgba(255,255,255,0.12);
          padding:0 40px; height:64px;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:100;
        }
        .navbar::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .nav-brand { display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
        .logo-mark {
          width:36px; height:36px;
          background:rgba(255,255,255,0.15); border:1.5px solid rgba(255,255,255,0.35);
          border-radius:8px; display:flex; align-items:center; justify-content:center;
        }
        .logo-text { font-family:'Instrument Serif',serif; font-size:17px; color:#fff; }
        .back-link {
          position:relative; z-index:1;
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.6);
          text-decoration:none; border:1px solid rgba(255,255,255,0.2);
          border-radius:8px; padding:7px 14px; transition:color 0.15s,border-color 0.15s;
        }
        .back-link:hover { color:#fff; border-color:rgba(255,255,255,0.45); }

        .page { max-width:520px; margin:0 auto; padding:48px 24px 80px; animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:600px){ .page{padding:32px 16px 60px;} .navbar{padding:0 16px;} }

        .success-hero { display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:32px; }
        .success-ring {
          width:64px; height:64px; border-radius:50%;
          background:var(--blue-light); border:1.5px solid var(--blue-mid);
          display:flex; align-items:center; justify-content:center; margin-bottom:16px;
        }
        .card-eyebrow {
          font-size:11px; font-weight:700; letter-spacing:0.12em;
          text-transform:uppercase; color:var(--blue); margin-bottom:6px;
        }
        .success-title { font-size:28px; font-weight:700; color:var(--text); line-height:1.15; }
        .header-rule { width:48px; height:3px; background:var(--blue); border-radius:2px; margin:12px auto 10px; }
        .success-sub { font-size:13.5px; color:var(--text-muted); font-weight:400; }

        .summary-card {
          background:var(--white); border-radius:16px;
          border:1px solid var(--border); overflow:hidden; margin-bottom:16px;
        }
        .summary-head {
          background:var(--blue); padding:14px 20px; position:relative; overflow:hidden;
        }
        .summary-head::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:32px 32px; pointer-events:none;
        }
        .summary-head-title { font-family:'Instrument Serif',serif; font-size:16px; color:#fff; position:relative; z-index:1; }

        .summary-body { padding:20px; display:flex; flex-direction:column; gap:12px; }
        .summary-row { display:flex; justify-content:space-between; align-items:center; font-size:13.5px; }
        .summary-label { color:var(--text-muted); }
        .summary-value { font-weight:600; color:var(--text); }
        .summary-divider { height:1px; background:var(--border); }

        .status-chip { background:#eaf2ff; color:#1a5276; border:1px solid #aed6f1; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.05em; }
        .fee-value { color:var(--blue-dark); font-weight:700; }

        .actions { display:flex; gap:10px; margin-bottom:24px; }
        .btn-outline {
          flex:1; padding:12px; border-radius:8px;
          border:1.5px solid var(--border); background:var(--white);
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:var(--text); cursor:pointer; transition:border-color 0.15s;
        }
        .btn-outline:hover { border-color:var(--blue); }
        .btn-primary {
          flex:1; padding:12px; border-radius:8px;
          border:none; background:var(--blue); color:#fff;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:background 0.15s,transform 0.12s,box-shadow 0.15s;
        }
        .btn-primary:hover { background:var(--blue-dark); box-shadow:0 4px 16px rgba(22,105,169,0.25); transform:translateY(-1px); }

        .security-note {
          display:flex; align-items:center; justify-content:center; gap:6px;
          padding-top:20px; border-top:1px solid var(--border);
        }
        .security-note span { font-size:11.5px; color:#bbb; line-height:1.5; text-align:center; }
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="card-eyebrow">Assignment complete</p>
          <h1 className="success-title">Claim Assigned!</h1>
          <div className="header-rule" />
          <p className="success-sub">Your claim has been successfully assigned to the agency.</p>
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

        <div className="security-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            We are a technology platform that connects businesses with independent, licensed
            collection agencies. We do not provide debt collection services, legal advice,
            or contact debtors on your behalf.
          </span>
        </div>
      </div>
    </>
  );
}