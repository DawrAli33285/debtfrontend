import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Add these imports at the top
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { BASE_URL } from '../api/auth';
import { getAccountOverview, updateAccountProfile, updateAccountPassword } from '../api/auth';

const PLAN_META = {
  starter:      { label: 'Starter',      color: '#7a96a8', bg: '#f5f7fa', claims: 25,     price: '$29' },
  growth:       { label: 'Growth',       color: '#1669A9', bg: '#e8f2fa', claims: 75,     price: '$79' },
  professional: { label: 'Professional', color: '#6c3ec1', bg: '#f3eefa', claims: 150,    price: '$149' },
  enterprise:   { label: 'Enterprise',   color: '#1e8449', bg: '#eafaf1', claims: 999999, price: 'Custom' },
};

const PLANS = [
  { key: 'starter',      label: 'Starter',      price: '$29/mo',  claims: 25,  features: ['25 claims/month', 'Email support', 'Basic analytics'] },
  { key: 'growth',       label: 'Growth',        price: '$79/mo',  claims: 75,  features: ['75 claims/month', 'Priority support', 'Advanced analytics'] },
  { key: 'professional', label: 'Professional',  price: '$149/mo', claims: 150, features: ['150 claims/month', 'Dedicated support', 'Full analytics'] },
  { key: 'enterprise',   label: 'Enterprise',    price: 'Custom',  claims: null,features: ['Unlimited claims', '24/7 support', 'Custom integrations'] },
];

const PAYPAL_CLIENT_ID = "AUH8Cb7tNZVz2s3oLMx1TEL2jjqU-aJOF1k2PiEBfybGNiF10YGadyPXMOYi_h_t9_-N3L_Ocmcok3XB";

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect for occasional claims',
    price: '19.99',
    amount: 19.99,
    claimsLimit: 3,
    popular: false,
    features: [
      { label: '3 claims per month', bold: '3 claims' },
      { label: 'Licensed agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing businesses',
    price: '39.99',
    amount: 39.99,
    claimsLimit: 10,
    popular: true,
    features: [
      { label: '10 claims per month', bold: '10 claims' },
      { label: 'Priority agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
      { label: 'Status email notifications' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Unlimited',
    tagline: 'For high-volume operations',
    price: '49.00',
    amount: 49.00,
    claimsLimit: 999999,
    popular: false,
    features: [
      { label: 'Unlimited claims per month', bold: 'Unlimited claims' },
      { label: 'Priority agency matching' },
      { label: 'Document uploads (5 per claim)' },
      { label: 'Dashboard tracking' },
      { label: 'Status email notifications' },
      { label: 'Dedicated account support' },
    ],
  },
];

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 99999,
      background: toast.type === 'error' ? '#fdf0ef' : '#eafaf1',
      border: `1px solid ${toast.type === 'error' ? '#f1c0bc' : '#a9dfbf'}`,
      color: toast.type === 'error' ? '#c0392b' : '#1e8449',
      padding: '12px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideIn 0.25s cubic-bezier(.22,1,.36,1) both', maxWidth: 360,
    }}>
      {toast.type === 'error'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      }
      {toast.msg}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{
        background: '#1669A9', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{
          width: 28, height: 28, background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1, flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', position: 'relative', zIndex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#7a96a8', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', border: '1.5px solid #e0e7ef',
          borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: '#1a2a3a',
          outline: 'none', background: '#f5f7fa', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = '#1669A9'}
        onBlur={e => e.target.style.borderColor = '#e0e7ef'}
      />
    </div>
  );
}


function PayPalLoadingSpinner() {
    const [{ isPending }] = usePayPalScriptReducer();
    if (!isPending) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', fontSize: 13, color: '#7a96a8' }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e0e7ef', borderTopColor: '#1669A9', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
        Loading PayPal…
      </div>
    );
  }
  
  function PayPalCheckout({ plan, planId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const createSubscription = (_data, actions) =>
      actions.subscription.create({ plan_id: planId });
  
    const onApprove = async (data) => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      try {
        const res = await fetch(`${BASE_URL}/businessSubscription/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            subscriptionId: data.subscriptionID,
            email: user?.email,
            planName: plan.id,
            claimsLimit: plan.claimsLimit,
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || 'Failed to confirm subscription');
        }
        setLoading(false);
        onSuccess(data.subscriptionID);
      } catch (err) {
        setError('Payment approved but failed to save. Please contact support.');
        setLoading(false);
      }
    };
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PayPalLoadingSpinner />
        <PayPalButtons
          style={{ shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' }}
          createSubscription={createSubscription}
          onApprove={onApprove}
          onError={() => setError('PayPal encountered an error. Please try again.')}
          onCancel={() => setError('Payment cancelled.')}
        />
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#7a96a8' }}>
            <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #e0e7ef', borderTopColor: '#1669A9', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            Processing…
          </div>
        )}
        {error && (
          <div style={{ background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b', fontSize: 13, padding: '10px 14px', borderRadius: 9, display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#7a96a8' }}>Secured by PayPal · Cancel anytime</p>
      </div>
    );
  }
  
  function CheckoutModal({ plan, onClose, onSuccess }) {
    const [planId, setPlanId] = useState(null);
    const [fetchError, setFetchError] = useState('');
    const [fetching, setFetching] = useState(true);
  
    useEffect(() => {
      const run = async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${BASE_URL}/businessSubscription/get-plan-id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount: plan.amount, planName: plan.id, claimsLimit: plan.claimsLimit }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Server error: ${res.status}`);
          }
          const { planId: id } = await res.json();
          if (!id) throw new Error('No plan ID returned from server');
          setPlanId(id);
        } catch (err) {
          setFetchError(err.message || 'Failed to load payment options.');
        } finally {
          setFetching(false);
        }
      };
      run();
    }, []);
  
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeUp 0.25s cubic-bezier(.22,1,.36,1) both' }}>
          {/* Header */}
          <div style={{ background: '#1669A9', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 1, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Subscribe to</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{plan.name} Plan</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{plan.tagline}</p>
            </div>
          </div>
          {/* Price summary */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #e0e7ef', background: '#f5f7fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a96a8' }}>Monthly Total</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: '#1a2a3a', lineHeight: 1.1 }}>${plan.price}<span style={{ fontSize: 13, fontWeight: 400, color: '#7a96a8' }}>/mo</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a96a8' }}>Claims</p>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1669A9', marginTop: 2 }}>{plan.claimsLimit === 999999 ? 'Unlimited' : `${plan.claimsLimit} / month`}</p>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding: 24 }}>
            {fetching && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 0', fontSize: 13, color: '#7a96a8' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e0e7ef', borderTopColor: '#1669A9', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Preparing checkout…
              </div>
            )}
            {fetchError && (
              <div style={{ background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b', fontSize: 13, padding: '10px 14px', borderRadius: 9, marginBottom: 12 }}>
                {fetchError}
              </div>
            )}
            {!fetching && !fetchError && planId && (
              <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, vault: true, intent: 'subscription' }}>
                <PayPalCheckout plan={plan} planId={planId} onSuccess={onSuccess} />
              </PayPalScriptProvider>
            )}
          </div>
        </div>
      </div>
    );
  }


export default function BuinsessAccount() {
    const navigate = useNavigate();
  
    // ALL hooks must be declared before any early returns
    const [user, setUser]               = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [email, setEmail]             = useState('');
    const [phone, setPhone]             = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [tab, setTab]                 = useState('overview');
    const [toast, setToast]             = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan]   = useState(null);
    const [currentPw, setCurrentPw]     = useState('');
    const [newPw, setNewPw]             = useState('');
    const [confirmPw, setConfirmPw]     = useState('');
    const [pwSaving, setPwSaving]       = useState(false);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      (async () => {
        const res = await getAccountOverview();
        setPageLoading(false);
        if (res.user) {
          setUser(res.user);
          setEmail(res.user.email);
          setPhone(res.user.phone || '');
        }
      })();
    }, []);
  
    // Early returns AFTER all hooks
    if (pageLoading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, border: '2px solid #e0e7ef', borderTopColor: '#1669A9', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
    if (!user) return null;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const planMeta = PLAN_META[user.subscription_plan] || PLAN_META.starter;
  const claimsRemaining = user.monthly_claim_limit === 999999 ? '∞' : Math.max(0, user.monthly_claim_limit - user.claims_used_this_month);
  const usagePct = user.monthly_claim_limit === 999999 ? 0 : Math.min(100, (user.claims_used_this_month / user.monthly_claim_limit) * 100);
  const daysLeft = user.billing_cycle_end
  ? Math.max(0, Math.ceil((new Date(user.billing_cycle_end) - new Date()) / (1000 * 60 * 60 * 24)))
  : 0;
  
  const handleProfileSave = async () => {
    setProfileSaving(true);
    const res = await updateAccountProfile({ email, phone, contact_name: user.name, business_name: user.business_name });
    setProfileSaving(false);
    if (res.user) {
      setUser(prev => ({ ...prev, email: res.user.email }));
      showToast('Profile updated successfully.');
    } else {
      showToast(res.message || 'Failed to update profile.', 'error');
    }
  };


  const handlePasswordSave = async () => {
    if (!currentPw || !newPw || !confirmPw) return showToast('Please fill all fields.', 'error');
    if (newPw !== confirmPw) return showToast('New passwords do not match.', 'error');
    if (newPw.length < 8) return showToast('Password must be at least 8 characters.', 'error');
    setPwSaving(true);
    const res = await updateAccountPassword({ currentPassword: currentPw, newPassword: newPw });
    setPwSaving(false);
    if (res.message === 'Password updated successfully.') {
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully.');
    } else {
      showToast(res.message || 'Failed to update password.', 'error');
    }
  };


  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'plan',     label: 'Plan & Billing' },
    { key: 'profile',  label: 'Profile' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #1669A9; --blue-dark: #0f5189; --blue-light: #e8f2fa;
          --blue-mid: #c5ddf0; --white: #fff; --off-white: #f5f7fa;
          --border: #e0e7ef; --text: #1a2a3a; --text-mid: #4a6070; --text-muted: #7a96a8;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--off-white); color: var(--text); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .tab-btn:hover:not(.active) { background: #f0f4f8; color: var(--text); }
        .plan-card:hover { border-color: var(--blue) !important; }
        .save-btn:hover:not(:disabled) { background: var(--blue-dark) !important; }
      `}</style>

      <Toast toast={toast} />

      {/* Navbar */}
      <nav style={{
        background: '#1669A9', height: 64, padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <Link to="/dashboard" style={{
          position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)',
          textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8, padding: '7px 14px', transition: 'all 0.15s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Dashboard
        </Link>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>{user.name.charAt(0)}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px', animation: 'fadeUp 0.4s both' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1669A9', marginBottom: 6 }}>Account</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a2a3a', marginBottom: 4 }}>My Account</h1>
          <div style={{ width: 44, height: 3, background: '#1669A9', borderRadius: 2, marginBottom: 8 }} />
          <p style={{ fontSize: 13.5, color: '#7a96a8' }}>Manage your profile, plan, and account settings.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 18px', borderRadius: 8, border: '1.5px solid',
                borderColor: tab === t.key ? '#1669A9' : '#e0e7ef',
                background: tab === t.key ? '#e8f2fa' : '#fff',
                color: tab === t.key ? '#1669A9' : '#7a96a8',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeUp 0.3s both' }}>

            {/* User info card */}
            <div style={{
              background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14,
              padding: '24px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg,#1669A9,#0f5189)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{user.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2a3a', marginBottom: 3 }}>{user.name}</h2>
                <p style={{ fontSize: 13.5, color: '#7a96a8', marginBottom: 4 }}>{user.email}</p>
                <p style={{ fontSize: 12, color: '#7a96a8' }}>Member since {new Date(user.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                background: planMeta.bg, color: planMeta.color,
                border: `1px solid ${planMeta.color}33`,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: planMeta.color }} />
                {planMeta.label} Plan
              </span>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                {
                  label: 'Claims Used',
                  value: user.claims_used_this_month,
                  sub: 'this billing period',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>,
                  color: '#1669A9', bg: '#e8f2fa',
                },
                {
                  label: 'Claims Remaining',
                  value: claimsRemaining,
                  sub: 'in current period',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8449" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
                  color: '#1e8449', bg: '#eafaf1',
                },
                {
                  label: 'Days Left',
                  value: daysLeft,
                  sub: 'until renewal',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a7d0a" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  color: '#9a7d0a', bg: '#fef9e7',
                },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12,
                  padding: '18px 20px',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    {s.icon}
                  </div>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#1a2a3a', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: '#7a96a8', marginTop: 2 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Usage bar */}
            <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>Monthly Usage</p>
                  <p style={{ fontSize: 12, color: '#7a96a8' }}>{user.claims_used_this_month} of {user.monthly_claim_limit === 999999 ? 'Unlimited' : user.monthly_claim_limit} claims used</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: usagePct > 80 ? '#c0392b' : '#1669A9' }}>{Math.round(usagePct)}%</span>
              </div>
              <div style={{ height: 8, background: '#f0f4f8', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${usagePct}%`,
                  background: usagePct > 80 ? 'linear-gradient(90deg,#e74c3c,#c0392b)' : 'linear-gradient(90deg,#1669A9,#0f5189)',
                  transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                }} />
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setTab('plan')} style={{
                padding: '14px 20px', borderRadius: 10, border: '1.5px solid #e0e7ef',
                background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#1669A9'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e0e7ef'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#e8f2fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>Upgrade Plan</p>
                  <p style={{ fontSize: 12, color: '#7a96a8' }}>Get more claims & features</p>
                </div>
              </button>
              <a href="mailto:support@example.com" style={{
                padding: '14px 20px', borderRadius: 10, border: '1.5px solid #e0e7ef',
                background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                textDecoration: 'none', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#1669A9'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e0e7ef'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eafaf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e8449" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>Contact Support</p>
                  <p style={{ fontSize: 12, color: '#7a96a8' }}>We're here to help</p>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* ── PLAN TAB ── */}
        {tab === 'plan' && (
          <div style={{ animation: 'fadeUp 0.3s both' }}>
            <SectionCard title="Current Plan" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: planMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: planMeta.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#1a2a3a' }}>{planMeta.label} Plan</p>
                    <p style={{ fontSize: 13, color: '#7a96a8' }}>{user.billing_cycle_end ? `Renews in ${daysLeft} days` : 'No active subscription'} · {planMeta.price}/mo</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/business-plans')}
                  style={{
                    padding: '10px 20px', borderRadius: 9, border: 'none',
                    background: '#1669A9', color: '#fff', fontSize: 13.5,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >Change Plan</button>
              </div>
            </SectionCard>

            <SectionCard title="Available Plans" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
    {plans.map((plan, i) => {
      const isCurrent = plan.id === user.subscription_plan || 
                        (plan.id === 'enterprise' && user.subscription_plan === 'unlimited');
      return (
        <div key={plan.id} style={{
          border: `1.5px solid ${isCurrent ? '#1669A9' : '#e0e7ef'}`,
          borderRadius: 12, padding: '18px 20px',
          background: isCurrent ? '#e8f2fa' : '#fff',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2a3a' }}>{plan.name}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1669A9', marginTop: 2 }}>${plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: '#7a96a8' }}>/mo</span></p>
            </div>
            {isCurrent && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1669A9', background: '#c5ddf0', padding: '3px 9px', borderRadius: 20 }}>Current</span>
            )}
            {plan.popular && !isCurrent && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9a7d0a', background: '#fef9e7', border: '1px solid #f9e79f', padding: '3px 9px', borderRadius: 20 }}>Popular</span>
            )}
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {plan.features.map(f => (
              <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#4a6070' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1669A9" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f.label}
              </li>
            ))}
          </ul>
          {!isCurrent && (
            <button
              onClick={() => setSelectedPlan(plan)}
              style={{
                width: '100%', padding: '9px', borderRadius: 8,
                border: '1.5px solid #1669A9', background: 'transparent',
                color: '#1669A9', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1669A9'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1669A9'; }}
            >Select Plan</button>
          )}
        </div>
      );
    })}
  </div>
</SectionCard>


            {/* Support */}
            <div style={{
              background: '#1669A9', borderRadius: 14, padding: '22px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
                backgroundSize: '28px 28px',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Need help choosing?</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Our team will help you find the right plan for your needs.</p>
              </div>
              <a href="rsmith@collectionconnector.com" style={{
                position: 'relative', zIndex: 1,
                padding: '10px 20px', borderRadius: 9,
                border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 13.5, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeUp 0.3s both' }}>
            <SectionCard title="Personal Information" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                <InputField label="Full Name" value={user.name} onChange={(v) => setUser(prev => ({ ...prev, name: v }))} placeholder="Your name" />
                </div>
                <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              
                <div style={{ gridColumn: 'span 2' }}>
                <InputField label="Business Name" value={user.business_name} onChange={(v) => setUser(prev => ({ ...prev, business_name: v }))} placeholder="Your company" />

                </div>
              </div>
              <button
                className="save-btn"
                onClick={handleProfileSave}
                disabled={profileSaving}
                style={{
                  padding: '11px 24px', borderRadius: 9, border: 'none',
                  background: '#1669A9', color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: profileSaving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
                }}
              >
                {profileSaving && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </SectionCard>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <div style={{ animation: 'fadeUp 0.3s both' }}>
            <SectionCard title="Change Password" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}>
              <div style={{ maxWidth: 420 }}>
                <InputField label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
                <InputField label="New Password" type="password" value={newPw} onChange={setNewPw} placeholder="••••••••" />
                <InputField label="Confirm New Password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" />
                <div style={{ background: '#fef9e7', border: '1px solid #f9e79f', borderRadius: 9, padding: '10px 14px', fontSize: 12.5, color: '#9a7d0a', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Password must be at least 8 characters long.
                </div>
                <button
                  className="save-btn"
                  onClick={handlePasswordSave}
                  disabled={pwSaving}
                  style={{
                    padding: '11px 24px', borderRadius: 9, border: 'none',
                    background: '#1669A9', color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: pwSaving ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', opacity: pwSaving ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
                  }}
                >
                  {pwSaving && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Support" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}>
              <p style={{ fontSize: 13.5, color: '#7a96a8', marginBottom: 16 }}>Having trouble with your account? Our support team is here to help.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="mailto:support@example.com" style={{
                  padding: '10px 20px', borderRadius: 9,
                  border: 'none', background: '#1669A9', color: '#fff',
                  fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email Support
                </a>
                <a href="tel:+1317-721-8177" style={{
                  padding: '10px 20px', borderRadius: 9,
                  border: '1.5px solid #e0e7ef', background: '#fff', color: '#1a2a3a',
                  fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  Call Support
                </a>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      {selectedPlan && (
  <CheckoutModal
    plan={selectedPlan}
    onClose={() => setSelectedPlan(null)}
    onSuccess={(id) => { setSelectedPlan(null); showToast('Plan upgraded successfully!'); }}
  />
)}
    </>
  );
}   