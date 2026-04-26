import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAgencies } from '../api/auth';

export default function AgencyListing() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedAgency, setSelectedAgency] = useState(null);
const [showModal, setShowModal]           = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await getAgencies();
        setAgencies(res.agencies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  const handleSelect = (agency) => {
    navigate('/agencies/select', { state: { agency } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
       :root {
  --navy:   #1669A9;
  --navy-2: #0f5189;
  --gold:   #1669A9;
  --gold-l: #4a8fc4;
  --gold-d: #0f5189;
  --cream:  #f5f7fa;
  --muted:  #7a96a8;
  --border: #e0e7ef;
  --white:  #ffffff;
}
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--navy); }

        .navbar {
          background: var(--navy);
          border-bottom: 1px solid rgba(22,105,169,0.2);
          padding: 0 40px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }
        .navbar::after {
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
}
        .nav-brand { display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
        .logo-mark {
          width:32px; height:32px; border:1.5px solid var(--gold);
          border-radius:7px; display:flex; align-items:center; justify-content:center;
        }
        .logo-text { font-family:'Instrument Serif',serif; font-size:16px; color:#fff; }
        .back-link {
          position:relative; z-index:1;
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.5);
          text-decoration:none; border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; padding:7px 14px;
          transition:color 0.15s,border-color 0.15s;
        }
        .back-link:hover { color:#fff; border-color:rgba(255,255,255,0.28); }

        .page { max-width:960px; margin:0 auto; padding:48px 32px 80px; animation:fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:600px){ .page{padding:32px 16px 60px;} .navbar{padding:0 16px;} }
.page-eyebrow { color: var(--navy); }

        .page-title { font-family:'Instrument Serif',serif; font-size:34px; color:var(--navy); line-height:1.1; }
        .page-title em { color:var(--gold); font-style:italic; }
.header-divider {
  background: linear-gradient(90deg, #1669A9 0%, transparent 100%);
}

        .page-sub { font-size:13.5px; color:var(--muted); }

        .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-top:36px; }
        @media(max-width:640px){ .grid{grid-template-columns:1fr;} }

        .agency-card {
          background:var(--white); border-radius:18px;
          border:1px solid var(--border);
          box-shadow:0 2px 16px rgba(15,31,61,0.045);
          overflow:hidden;
          transition:box-shadow 0.2s, transform 0.2s;
        }
    .agency-card:hover { box-shadow: 0 6px 28px rgba(22,105,169,0.15); }
        .card-head {
          background:var(--navy); padding:16px 20px;
          display:flex; align-items:center; justify-content:space-between;
          position:relative; overflow:hidden;
        }
       .card-head::after {
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
}

        .card-name { font-family:'Instrument Serif',serif; font-size:18px; color:#fff; position:relative; z-index:1; }
      .verified-badge {
  background: rgba(22,105,169,0.15);
  color: #4a8fc4;
  border: 1px solid rgba(22,105,169,0.3);
}
        

        .card-body { padding:20px; }

        .card-meta { display:flex; flex-direction:column; gap:7px; margin-bottom:16px; }
        .meta-row { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--muted); }
        .meta-icon {
          width:22px; height:22px; border-radius:6px;
          background:rgba(15,31,61,0.05);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        .capacity-label { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-bottom:5px; }
        .capacity-track { width:100%; height:5px; background:rgba(15,31,61,0.08); border-radius:99px; overflow:hidden; margin-bottom:16px; }
        .capacity-fill { height:100%; border-radius:99px; transition:width 0.4s; }
.fill-ok { background: linear-gradient(90deg, #0f5189, #1669A9); }
        .fill-full { background:#e74c3c; }

        .select-btn {
          width:100%; padding:10px; border-radius:10px;
          font-size:13px; font-weight:600; cursor:pointer;
          border:none; transition:all 0.15s;
        }
        .select-btn-active {
          background:var(--navy); color:#fff;
        }
        .select-btn-active:hover { background:var(--navy-2); }
        .select-btn-disabled {
          background:rgba(15,31,61,0.05); color:var(--muted); cursor:not-allowed;
        }

        .loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; gap:14px; }
.spinner-ring { border-top-color: #1669A9; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .loading-text { font-size:13.5px; color:var(--muted); }

        .empty-state { text-align:center; padding:60px 24px; color:var(--muted); font-size:14px; }
      `}</style>


<nav className="navbar">
        <div className="nav-actions">
         
         
          <Link to="/dashboard" className="back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>
   

      <div className="page">
        <p className="page-eyebrow">Network</p>
        <h1 className="page-title">Collection <em>Agencies</em></h1>
        <div className="header-divider" />
        <p className="page-sub">Select a verified agency to handle your claim</p>

        {loading && (
          <div className="loading-wrap">
            <div className="spinner-ring" />
            <p className="loading-text">Loading agencies…</p>
          </div>
        )}

        {!loading && agencies.length === 0 && (
          <div className="empty-state">No agencies available at this time.</div>
        )}

        {!loading && agencies.length > 0 && (
          <div className="grid">
            {agencies.map((agency) => {
              const full = agency.claims_used >= agency.claim_limit;
              const pct  = Math.min((agency.claims_used / agency.claim_limit) * 100, 100);
              return (
                <div key={agency._id} className="agency-card">
                  <div className="card-head">
                    <span className="card-name">{agency.name}</span>
                    {agency.is_verified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      <div className="meta-row">
                        <div className="meta-icon">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8a95a3" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        {agency.states_covered?.join(', ') || 'Nationwide'}
                      </div>
                      <div className="meta-row">
                        <div className="meta-icon">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8a95a3" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        </div>
                        {agency.specialties?.join(', ') || 'General'}
                      </div>
                      <div className="meta-row">
                        <div className="meta-icon">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8a95a3" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        </div>
                        {agency.fee_percentage}% fee on recovery
                      </div>
                    </div>

                    <div className="capacity-label">
                      <span>Capacity</span>
                      <span>{agency.claims_used}/{agency.claim_limit} claims</span>
                    </div>
                    <div className="capacity-track">
                      <div className={`capacity-fill ${full ? 'fill-full' : 'fill-ok'}`} style={{width:`${pct}%`}} />
                    </div>

                    <button
                      onClick={() => handleSelect(agency)}
                      disabled={full}
                      className={`select-btn ${full ? 'select-btn-disabled' : 'select-btn-active'}`}
                    >
                      {full ? 'At Capacity' : 'Select Agency →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}