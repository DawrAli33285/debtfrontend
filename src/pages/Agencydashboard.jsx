import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAgencyMe, getAgencyAssignments, updateAssignmentStatus } from '../api/auth';

const PLAN_META = {
  starter:      { color: '#6b7280', bg: '#f3f4f6' },
  growth:       { color: '#2563eb', bg: '#eff6ff' },
  professional: { color: '#7c3aed', bg: '#f5f3ff' },
  enterprise:   { color: '#a8883a', bg: '#fefce8' },
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const [agency, setAgency]           = useState(null);
  const [user, setUser]               = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeTab, setActiveTab]     = useState('all');
  const [updating, setUpdating]       = useState(null);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    if (!localStorage.getItem('agencyToken')) { navigate('/agency/login'); return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [meRes, assignRes] = await Promise.all([getAgencyMe(), getAgencyAssignments()]);
      
      console.log('meRes:', meRes); // ← add this temporarily to debug
      
      if (meRes.error || !meRes.agency) {  // ← check for error field too
        navigate('/agency/login');
        return;
      }
      setAgency(meRes.agency);
      setUser(meRes.user);
      setAssignments(assignRes.assignments || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard. Please refresh.');
    }
    setLoading(false);
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdating(assignmentId);
    const res = await updateAssignmentStatus({ assignment_id: assignmentId, status: newStatus });
    if (res.assignment) setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, status: newStatus } : a));
    setUpdating(null);
  };

  const handleLogout = () => { localStorage.removeItem('agencyToken'); navigate('/agency/login'); };

  const filtered = assignments.filter(a => {
    const matchTab = activeTab === 'all' || a.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (a.claim_id?.debtor_name || '').toLowerCase().includes(q)
      || (a.claim_id?.debtor_email || '').toLowerCase().includes(q)
      || String(a.claim_id?.amount || '').includes(q);
    return matchTab && matchSearch;
  });

  const stats = {
    total:       assignments.length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    closed:      assignments.filter(a => a.status === 'closed').length,
    totalValue:  assignments.reduce((s, a) => s + (a.claim_id?.amount || 0), 0),
  };

  const planUsedPct = agency
    ? Math.min(100, Math.round(((agency.claims_used || 0) / (agency.claim_limit || 1)) * 100))
    : 0;

  if (loading) return (
    <div className="dash-loading">
      <div className="load-spinner" />
      <p>Loading your dashboard…</p>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
        .dash-loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#faf8f4;font-family:'DM Sans',sans-serif;color:#8a95a3;font-size:14px}
        .load-spinner{width:32px;height:32px;border:3px solid #e4e2dd;border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--navy:#0f1f3d;--navy-2:#162847;--gold:#c9a84c;--gold-l:#e2c97e;--gold-d:#a8883a;--cream:#faf8f4;--muted:#8a95a3;--border:#e4e2dd;--white:#ffffff;--error:#c0392b}
        .dash-root{min-height:100vh;background:var(--cream);font-family:'DM Sans',sans-serif;display:flex;flex-direction:column}
        /* Nav */
        .dash-nav{background:var(--navy);padding:0 28px;display:flex;align-items:center;justify-content:space-between;height:58px;position:sticky;top:0;z-index:50}
        .nav-brand{display:flex;align-items:center;gap:10px}
        .logo-mark{width:30px;height:30px;border:1.5px solid var(--gold);border-radius:7px;display:flex;align-items:center;justify-content:center}
        .logo-text{font-family:'Instrument Serif',serif;font-size:15px;color:#fff;letter-spacing:.01em}
        .nav-right{display:flex;align-items:center;gap:16px}
        .nav-user-pill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:5px 12px 5px 6px}
        .nav-avatar{width:24px;height:24px;border-radius:50%;background:var(--gold);color:var(--navy);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .nav-user-name{font-size:12.5px;color:rgba(255,255,255,.85);font-weight:500}
        .nav-agency-label{font-size:12px;color:rgba(255,255,255,.45)}
        .nav-agency-label strong{color:rgba(255,255,255,.75);font-weight:500}
        .btn-logout{font-size:12px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color .15s;padding:0}
        .btn-logout:hover{color:var(--gold-l)}
        /* Body */
        .dash-body{flex:1;padding:28px 32px;max-width:1300px;margin:0 auto;width:100%}
        @media(max-width:768px){.dash-body{padding:16px}}
        /* Header */
        .dash-header{margin-bottom:24px}
        .dash-header h1{font-family:'Instrument Serif',serif;font-size:24px;color:var(--navy);margin-bottom:3px}
        .dash-header p{font-size:13px;color:var(--muted)}
        .err-box{background:#fdf0ef;border:1px solid #f1c0bc;color:var(--error);font-size:13px;padding:10px 14px;border-radius:10px;margin-bottom:20px}
        /* Stats */
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
        @media(max-width:900px){.stats-row{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.stats-row{grid-template-columns:1fr 1fr}}
        .stat-card{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:18px 20px;animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
        .stat-card:nth-child(1){animation-delay:.04s}.stat-card:nth-child(2){animation-delay:.08s}.stat-card:nth-child(3){animation-delay:.12s}.stat-card:nth-child(4){animation-delay:.16s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .stat-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
        .stat-value{font-size:26px;color:var(--navy);line-height:1;margin-bottom:3px}
        .stat-value.serif{font-family:'Instrument Serif',serif}
        .stat-value.accent{color:var(--gold-d)}
        .stat-sub{font-size:11.5px;color:var(--muted)}
        /* Grid */
        .dash-grid{display:grid;grid-template-columns:1fr 290px;gap:18px;align-items:start}
        @media(max-width:1100px){.dash-grid{grid-template-columns:1fr}}
        /* Panel */
        .panel{background:var(--white);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .4s cubic-bezier(.22,1,.36,1) .22s both}
        .panel-header{padding:18px 22px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
        .panel-title{font-family:'Instrument Serif',serif;font-size:17px;color:var(--navy)}
        .search-wrap{position:relative}
        .search-wrap input{border:1.5px solid var(--border);border-radius:8px;padding:7px 12px 7px 32px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--navy);background:var(--cream);outline:none;width:190px;transition:border-color .18s,background .18s}
        .search-wrap input:focus{border-color:var(--navy);background:var(--white)}
        .search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
        .tabs{display:flex;gap:2px;padding:14px 22px 0;border-bottom:1px solid var(--border);overflow-x:auto}
        .tab{font-size:13px;font-weight:500;padding:7px 12px 11px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;border-top:none;border-left:none;border-right:none;transition:color .15s,border-color .15s;background:none;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .tab:hover{color:var(--navy)}.tab.active{color:var(--navy);border-bottom-color:var(--navy);font-weight:600}
        .tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:99px;font-size:10px;font-weight:700;background:var(--cream);color:var(--muted);margin-left:5px;padding:0 4px}
        .tab.active .tab-count{background:var(--navy);color:#fff}
        .table-wrap{overflow-x:auto}
        .claim-table{width:100%;border-collapse:collapse}
        .claim-table th{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:11px 16px;text-align:left;border-bottom:1px solid var(--border);background:#fcfbf9;white-space:nowrap}
        .claim-table td{padding:13px 16px;font-size:13.5px;color:var(--navy);border-bottom:1px solid var(--border);vertical-align:middle}
        .claim-table tr:last-child td{border-bottom:none}
        .claim-table tbody tr:hover td{background:#faf8f4}
        .debtor-name{font-weight:600;margin-bottom:2px}
        .debtor-email{font-size:11.5px;color:var(--muted)}
        .amount-cell{font-family:'Instrument Serif',serif;font-size:15px}
        .status-select{border:1.5px solid var(--border);border-radius:7px;padding:5px 8px;font-size:12px;font-family:'DM Sans',sans-serif;color:var(--navy);background:var(--cream);cursor:pointer;outline:none;transition:border-color .15s;min-width:128px}
        .status-select:focus{border-color:var(--navy)}.status-select:disabled{opacity:.5;cursor:wait}
        .empty-state{text-align:center;padding:52px 24px}
        .empty-icon{width:44px;height:44px;border-radius:12px;background:var(--cream);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
        .empty-state p{font-size:14px;font-weight:600;color:var(--navy);margin-bottom:4px}
        .empty-state span{font-size:13px;color:var(--muted)}
        /* Sidebar */
        .sidebar{display:flex;flex-direction:column;gap:14px}
        .side-card{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:18px;animation:fadeUp .4s cubic-bezier(.22,1,.36,1) .28s both}
        .side-card-title{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
        .plan-badge{display:inline-flex;align-items:center;padding:4px 12px;border-radius:20px;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px}
        .plan-limits{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:7px}
        .plan-limits strong{color:var(--navy);font-weight:600}
        .progress-bar{height:5px;border-radius:99px;background:var(--border);overflow:hidden}
        .progress-fill{height:100%;border-radius:99px;background:var(--navy);transition:width .6s ease}
        .progress-fill.warn{background:#d97706}.progress-fill.danger{background:var(--error)}
        .profile-row{display:flex;flex-direction:column;gap:10px}
        .profile-item{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
        .profile-item-label{font-size:12px;color:var(--muted);flex-shrink:0}
        .profile-item-value{font-size:12.5px;color:var(--navy);font-weight:500;text-align:right;word-break:break-all}
        .verified-chip{display:inline-flex;align-items:center;gap:4px;background:#ecfdf5;color:#065f46;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px}
        .unverified-chip{display:inline-flex;align-items:center;gap:4px;background:#fffbeb;color:#92400e;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px}
        .mini-tags{display:flex;flex-wrap:wrap;gap:5px}
        .mini-tag{font-size:11px;padding:2px 8px;border-radius:20px;background:var(--cream);border:1px solid var(--border);color:var(--muted);font-weight:500}
        .quick-link{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:var(--navy);text-decoration:none;padding:9px 0;border-bottom:1px solid var(--border);transition:color .15s}
        .quick-link:last-child{border-bottom:none}.quick-link:hover{color:var(--gold-d)}
      `}</style>

      <div className="dash-root">
        <nav className="dash-nav">
          <div className="nav-brand">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" style={{width:15,height:15}}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="logo-text">Collections Connector</span>
          </div>
          <div className="nav-right">
            {agency && <span className="nav-agency-label"><strong>{agency.name}</strong></span>}
            {user && (
              <div className="nav-user-pill">
                <div className="nav-avatar">{user.name?.[0]?.toUpperCase()||'A'}</div>
                <span className="nav-user-name">{user.name}</span>
              </div>
            )}
            <button className="btn-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </nav>

        <div className="dash-body">
          <div className="dash-header">
            <h1>Agency Dashboard</h1>
            <p>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>

          {error && <div className="err-box">{error}</div>}

          <div className="stats-row">
            {[
              {label:'Total Assigned',   value:stats.total,               sub:'all time'},
              {label:'In Progress',      value:stats.in_progress,         sub:'active cases'},
              {label:'Closed',           value:stats.closed,              sub:'completed'},
              {label:'Total Claim Value',value:fmt(stats.totalValue),serif:true,accent:true,sub:'across all claims'},
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value${s.serif?' serif':''}${s.accent?' accent':''}`}>{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="dash-grid">
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Assigned Claims</h2>
                <div className="search-wrap">
                  <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Search debtor, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
              </div>

              <div className="tabs">
                {[{key:'all',label:'All'},{key:'assigned',label:'Assigned'},{key:'in_progress',label:'In Progress'},{key:'closed',label:'Closed'}].map(t=>(
                  <button key={t.key} className={`tab${activeTab===t.key?' active':''}`} onClick={()=>setActiveTab(t.key)}>
                    {t.label}
                    <span className="tab-count">{t.key==='all'?assignments.length:assignments.filter(a=>a.status===t.key).length}</span>
                  </button>
                ))}
              </div>

              {filtered.length===0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a95a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <p>No claims found</p>
                  <span>{search?'Try a different search term':'New assignments will appear here'}</span>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="claim-table">
                    <thead>
                      <tr><th>Debtor</th><th>Amount</th><th>Due Date</th><th>Assigned On</th><th>Update Status</th></tr>
                    </thead>
                    <tbody>
                      {filtered.map(a=>{
                        const claim=a.claim_id||{};
                        return (
                          <tr key={a._id}>
                            <td>
                              <div className="debtor-name">{claim.debtor_name||'—'}</div>
                              <div className="debtor-email">{claim.debtor_email||''}</div>
                            </td>
                            <td><span className="amount-cell">{fmt(claim.amount)}</span></td>
                            <td style={{color:'var(--muted)',fontSize:13}}>{fmtDate(claim.due_date)}</td>
                            <td style={{color:'var(--muted)',fontSize:12}}>{fmtDate(a.assigned_at)}</td>
                            <td>
                              <select className="status-select" value={a.status} disabled={updating===a._id} onChange={e=>handleStatusChange(a._id,e.target.value)}>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="sidebar">
              {agency && (
                <div className="side-card">
                  <p className="side-card-title">Plan & Usage</p>
                  {(()=>{const pm=PLAN_META[agency.plan_type]||PLAN_META.starter;return<div className="plan-badge" style={{background:pm.bg,color:pm.color}}>{(agency.plan_type||'starter').toUpperCase()}</div>;})()}
                  <div className="plan-limits"><span>Claims used</span><strong>{agency.claims_used||0} / {agency.claim_limit||25}</strong></div>
                  <div className="progress-bar">
                    <div className={`progress-fill${planUsedPct>=90?' danger':planUsedPct>=70?' warn':''}`} style={{width:`${planUsedPct}%`}}/>
                  </div>
                  {agency.subscription_end_date&&<p style={{fontSize:11.5,color:'var(--muted)',marginTop:9}}>Renews {fmtDate(agency.subscription_end_date)}</p>}
                </div>
              )}

              {agency && (
                <div className="side-card" style={{animationDelay:'.32s'}}>
                  <p className="side-card-title">Agency Profile</p>
                  <div className="profile-row">
                    <div className="profile-item">
                      <span className="profile-item-label">Status</span>
                      <span>{agency.is_verified
                        ?<span className="verified-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>
                        :<span className="unverified-chip">Pending</span>}
                      </span>
                    </div>
                    <div className="profile-item"><span className="profile-item-label">Fee rate</span><span className="profile-item-value">{agency.fee_percentage||0}%</span></div>
                    {agency.contact_email&&<div className="profile-item"><span className="profile-item-label">Email</span><span className="profile-item-value">{agency.contact_email}</span></div>}
                    {agency.contact_phone&&<div className="profile-item"><span className="profile-item-label">Phone</span><span className="profile-item-value">{agency.contact_phone}</span></div>}
                    {agency.specialties?.length>0&&(
                      <div><span className="profile-item-label" style={{display:'block',marginBottom:7}}>Specialties</span>
                      <div className="mini-tags">{agency.specialties.map(s=><span className="mini-tag" key={s}>{s}</span>)}</div></div>
                    )}
                    {agency.states_covered?.length>0&&(
                      <div><span className="profile-item-label" style={{display:'block',marginBottom:7}}>States ({agency.states_covered.length})</span>
                      <div className="mini-tags">
                        {agency.states_covered.slice(0,10).map(s=><span className="mini-tag" key={s}>{s}</span>)}
                        {agency.states_covered.length>10&&<span className="mini-tag">+{agency.states_covered.length-10}</span>}
                      </div></div>
                    )}
                  </div>
                </div>
              )}

              <div className="side-card" style={{animationDelay:'.36s'}}>
                <p className="side-card-title">Quick Links</p>
                {[{label:'Business portal',to:'/login'},{label:'Agency register',to:'/agency/register'}].map(l=>(
                  <Link key={l.to} to={l.to} className="quick-link">
                    {l.label}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}