import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BASE_URL } from '../api/auth';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for occasional claims',
    price: '99',
    amount: 99,
    claimsLimit: 25,
    features: [
      { label: '25 claims per year', bold: '25 claims' },
      { label: 'Licensed agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
    ],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing businesses',
    price: '199',
    amount: 199,
    claimsLimit: 75,
    popular: true,
    features: [
      { label: '75 claims per year', bold: '75 claims' },
      { label: 'Priority agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
      { label: 'Status email notifications' },
    ],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'For established agencies',
    price: '299',
    amount: 299,
    claimsLimit: 150,
    features: [
      { label: '150 claims per year', bold: '150 claims' },
      { label: 'Priority agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
      { label: 'Status email notifications' },
      { label: 'Advanced reporting' },
    ],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For high-volume operations',
    price: '499',
    amount: 499,
    claimsLimit: 999999,
    features: [
      { label: 'Unlimited claims per year', bold: 'Unlimited claims' },
      { label: 'Priority agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
      { label: 'Status email notifications' },
      { label: 'Dedicated account support' },
    ],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  },
];


const PAYPAL_CLIENT_ID = "AUH8Cb7tNZVz2s3oLMx1TEL2jjqU-aJOF1k2PiEBfybGNiF10YGadyPXMOYi_h_t9_-N3L_Ocmcok3XB";


function usePayPalSDK() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.paypal) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
  return ready;
}

function CheckIcon() {
  return (
    <div style={{ width:17, height:17, borderRadius:'50%', flexShrink:0, marginTop:2,
      background:'#e8f2fa', border:'1px solid #c5ddf0',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="3" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  );
}

function CheckoutModal({ plan, onClose, onSuccess }) {
  const paypalRef   = useRef(null);
  const sdkReady    = usePayPalSDK();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!sdkReady || !paypalRef.current || rendered) return;
    setRendered(true);

    window.paypal.Buttons({
      style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },

      createSubscription: (data, actions) => {
        setLoading(true);
        setError('');
        const token   = localStorage.getItem('agencyToken');
        const userRaw = localStorage.getItem('agencyUser');
        const user    = userRaw ? JSON.parse(userRaw) : null;

        return fetch(`${BASE_URL}/subscription/get-plan-id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount: plan.amount, planName: plan.id }),
        })
          .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Failed to get plan') });
            return res.json();
          })
          .then(data => {
            if (!data.planId) throw new Error('No plan ID returned from server');
            return actions.subscription.create({ plan_id: data.planId });
          })
          .catch(err => {
            setError(err.message || 'Something went wrong. Please try again.');
            setLoading(false);
            throw err;
          });
      },

      onApprove: (data) => {
        setLoading(true);
        const token   = localStorage.getItem('agencyToken');
        const userRaw = localStorage.getItem('agencyUser');
        const user    = userRaw ? JSON.parse(userRaw) : null;

        fetch(`${BASE_URL}/subscription/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            subscriptionId: data.subscriptionID,
            planName:       plan.id,
            claimsLimit:    plan.claimsLimit,
          }),
        })
          .then(res => res.json())
          .then(() => { setLoading(false); onSuccess(); })
          .catch(() => {
            setError('Payment approved but failed to save. Please contact support.');
            setLoading(false);
          });
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        setError('PayPal encountered an error. Please try again.');
        setLoading(false);
      },

      onCancel: () => {
        setError('Payment cancelled. You can try again.');
        setLoading(false);
      },
    }).render(paypalRef.current);
  }, [sdkReady, rendered]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(22,105,169,0.25)', backdropFilter:'blur(4px)' }}
    >
      <div style={{ width:'100%', maxWidth:420, borderRadius:18, overflow:'hidden', background:'#fff', animation:'fadeUp 0.3s cubic-bezier(.22,1,.36,1) both' }}>

        {/* Header */}
        <div style={{ background:'#1669A9', padding:'20px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:1, width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:4, position:'relative', zIndex:1 }}>Subscribe to</p>
          <p style={{ fontFamily:'Instrument Serif, serif', fontSize:22, color:'#fff', position:'relative', zIndex:1 }}>{plan.name} Plan</p>
          <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.45)', position:'relative', zIndex:1, marginTop:2 }}>{plan.tagline}</p>
        </div>

        {/* Summary */}
        <div style={{ padding:'14px 24px', background:'#f5f7fa', borderBottom:'1px solid #e0e7ef', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Instrument Serif, serif', fontSize:26, color:'#1a2a3a', display:'flex', alignItems:'baseline', gap:3 }}>
              <span style={{ fontSize:13, color:'#1669A9' }}>$</span>{plan.price}
            </div>
            <div style={{ fontSize:12, color:'#7a96a8' }}>/yr · billed annually</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'#7a96a8' }}>Claims</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#0f5189' }}>{plan.claimsLimit === 999999 ? 'Unlimited' : `${plan.claimsLimit} / year`}</p>
          </div>
        </div>

        {/* PayPal Button */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          {!sdkReady && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'16px 0', fontSize:13, color:'#7a96a8' }}>
              <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #e0e7ef', borderTopColor:'#1669A9', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
              Loading PayPal…
            </div>
          )}

          <div ref={paypalRef} />

          {loading && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, color:'#7a96a8' }}>
              <span style={{ width:13, height:13, borderRadius:'50%', border:'2px solid #e0e7ef', borderTopColor:'#1669A9', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
              Processing…
            </div>
          )}

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:9, fontSize:13, background:'#fdf0ef', border:'1px solid #f1c0bc', color:'#c0392b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <p style={{ textAlign:'center', fontSize:11, color:'#bbb' }}>Secured by PayPal · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}


export default function AgencySubscriptionPlans() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --blue:#1669A9; --blue-dark:#0f5189; --blue-2:#0d4070;
          --blue-light:#e8f2fa; --blue-mid:#c5ddf0;
          --white:#ffffff; --off-white:#f5f7fa; --border:#e0e7ef;
          --text:#1a2a3a; --text-muted:#7a96a8;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--off-white); }
        .navbar-grid::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .plan-card { background:#fff; border-radius:18px; border:1px solid var(--border); overflow:hidden; display:flex; flex-direction:column; transition:transform 0.2s; }
        .plan-card:hover { transform:translateY(-3px); }
        .plan-card.popular { border:2px solid var(--blue); }
        .plan-head { background:var(--blue); padding:24px; position:relative; overflow:hidden; }
        .plan-head.popular-head { background:var(--blue-dark); }
        .plan-head::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:32px 32px; pointer-events:none;
        }
        .popular-badge { position:absolute; top:14px; right:14px; z-index:1; background:#fff; color:var(--blue-dark); font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:3px 10px; border-radius:20px; }
        .plan-icon { position:relative; z-index:1; width:36px; height:36px; border-radius:9px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
        .plan-name { font-family:'Instrument Serif',serif; font-size:20px; color:#fff; position:relative; z-index:1; margin-bottom:3px; }
        .plan-tagline { font-size:11.5px; color:rgba(255,255,255,0.5); position:relative; z-index:1; }
        .plan-price { padding:18px 20px; border-bottom:1px solid var(--border); }
        .price-row { display:flex; align-items:baseline; gap:3px; margin-bottom:4px; }
        .price-dollar { font-family:'Instrument Serif',serif; font-size:13px; color:var(--blue); margin-top:4px; }
        .price-amount { font-family:'Instrument Serif',serif; font-size:40px; color:var(--text); line-height:1; }
        .price-period { font-size:13px; color:var(--text-muted); }
        .price-note { font-size:11px; color:var(--text-muted); }
        .plan-features { padding:18px 20px; flex:1; display:flex; flex-direction:column; gap:10px; }
        .feature-row { display:flex; align-items:flex-start; gap:9px; font-size:13px; color:var(--text); }
        .feature-bold { color:var(--blue-dark); font-weight:600; }
        .btn-plan { width:100%; padding:12px; border-radius:9px; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; background:var(--blue); color:#fff; transition:background 0.15s,transform 0.12s; }
        .btn-plan:hover { background:var(--blue-dark); transform:translateY(-1px); }
        .btn-plan.popular-btn { background:var(--blue-2); }
        .btn-plan.popular-btn:hover { background:#0a3460; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Navbar */}
      <nav className="navbar-grid" style={{ background:'var(--blue)', borderBottom:'1px solid rgba(255,255,255,0.12)', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40, overflow:'hidden' }}>
     
        <Link to="/agency/dashboard" style={{ position:'relative', zIndex:1, display:'inline-flex', alignItems:'center', gap:7, fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'7px 14px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'48px 24px 80px' }} className="fade-up">

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--blue)', marginBottom:8 }}>Subscription Plans</p>
          <h1 style={{ fontFamily:'Instrument Serif, serif', fontSize:38, color:'var(--text)', lineHeight:1.15, marginBottom:10 }}>
            Choose Your <em style={{ fontStyle:'italic', color:'var(--blue)' }}>Plan</em>
          </h1>
          <div style={{ width:48, height:3, background:'var(--blue)', borderRadius:2, margin:'0 auto 12px' }}/>
          <p style={{ fontSize:13.5, color:'var(--text-muted)' }}>Select the plan that best fits your claim volume. No rollover, no surprises.</p>
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:16 }}>
          {plans.map(plan => (
            <div key={plan.id} className={`plan-card${plan.popular ? ' popular' : ''}`}>
              <div className={`plan-head${plan.popular ? ' popular-head' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className="plan-icon">{plan.icon}</div>
                <div className="plan-name">{plan.name}</div>
                <div className="plan-tagline">{plan.tagline}</div>
              </div>
              <div className="plan-price">
                <div className="price-row">
                  <span className="price-dollar">$</span>
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">/ year</span>
                </div>
                <div className="price-note">Billed annually · No rollover</div>
              </div>
              <div className="plan-features">
                {plan.features.map((f, i) => (
                  <div key={i} className="feature-row">
                    <CheckIcon/>
                    <span>
                      {f.bold
                        ? <><span className="feature-bold">{f.bold}</span>{f.label.replace(f.bold, '')}</>
                        : f.label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'16px 20px 20px' }}>
                <button onClick={() => setSelectedPlan(plan)} className={`btn-plan${plan.popular ? ' popular-btn' : ''}`}>
                  Get Started
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign:'center', marginTop:32, fontSize:11.5, color:'#bbb', lineHeight:1.6 }}>
          All plans are billed annually. Claims do not roll over.<br/>
          We connect businesses with independent, licensed collection agencies and do not perform collection activities directly.
        </p>
      </div>

      {selectedPlan && (
        <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSuccess={() => { setSelectedPlan(null); navigate(-1); }}/>
      )}
    </>
  );
}