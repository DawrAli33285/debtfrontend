import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
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
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: 'unlimited',
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
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
];

const STRIPE_ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'DM Sans, sans-serif',
      color: '#0f1f3d',
      fontWeight: '500',
      '::placeholder': { color: '#8a95a3' },
    },
    invalid: { color: '#c0392b' },
  },
};

function CheckIcon() {
  return (
    <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

function CheckoutModal({ plan, onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const cardNumber = elements.getElement(CardNumberElement);
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      const res = await fetch('https://debtbackend.vercel.app/api/businessSubscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email:        user?.email,
          amount:       plan.amount,
          planName:     plan.id,
          claimsLimit:  plan.claimsLimit,
          paymentMethod: paymentMethod.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Subscription failed');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,31,61,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-[22px] overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(15,31,61,0.2)', animation: 'fadeUp 0.3s cubic-bezier(.22,1,.36,1) both' }}
      >

        {/* Modal Header */}
        <div className="relative overflow-hidden px-7 pt-6 pb-5" style={{ background: '#0f1f3d' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: '#c9a84c' }}>
              Subscribe to
            </p>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', color: '#fff' }}>
              {plan.name} Plan
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{plan.tagline}</p>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="px-7 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #e4e2dd', background: '#faf8f4' }}>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: '#8a95a3' }}>Monthly Total</p>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', color: '#0f1f3d', lineHeight: 1.1 }}>
              <span style={{ fontSize: '14px', color: '#a8883a' }}>$</span>{plan.price}
              <span className="text-sm font-normal ml-1" style={{ color: '#8a95a3' }}>/mo</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: '#8a95a3' }}>Claims</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#a8883a' }}>
              {plan.claimsLimit === 999999 ? 'Unlimited' : `${plan.claimsLimit} / month`}
            </p>
          </div>
        </div>

        {/* Card Fields */}
        <div className="px-7 py-6 flex flex-col gap-4">

          {/* Card Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold tracking-[0.09em] uppercase" style={{ color: '#8a95a3' }}>
              Card Number
            </label>
            <div className="px-3.5 py-3 rounded-[10px]" style={{ background: '#faf8f4', border: '1px solid #e4e2dd' }}>
              <CardNumberElement options={STRIPE_ELEMENT_STYLE} />
            </div>
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold tracking-[0.09em] uppercase" style={{ color: '#8a95a3' }}>
                Expiry Date
              </label>
              <div className="px-3.5 py-3 rounded-[10px]" style={{ background: '#faf8f4', border: '1px solid #e4e2dd' }}>
                <CardExpiryElement options={STRIPE_ELEMENT_STYLE} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-semibold tracking-[0.09em] uppercase" style={{ color: '#8a95a3' }}>
                CVC
              </label>
              <div className="px-3.5 py-3 rounded-[10px]" style={{ background: '#faf8f4', border: '1px solid #e4e2dd' }}>
                <CardCvcElement options={STRIPE_ELEMENT_STYLE} />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-[13px]"
              style={{ background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !stripe}
            className="w-full cursor-pointer rounded-xl py-3.5 text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#0f1f3d', color: '#fff', marginTop: '4px' }}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                Processing…
              </>
            ) : (
              <>
                Subscribe — ${plan.price}/mo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-[11px]" style={{ color: '#8a95a3' }}>
            Secured by Stripe · Cancel anytime
          </p>
        </div>

      </div>
    </div>
  );
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSuccess = () => {
    setSelectedPlan(null);
    navigate('/dashboard');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --navy: #0f1f3d; --navy-2: #162847;
          --gold: #c9a84c; --gold-l: #e2c97e; --gold-d: #a8883a;
          --cream: #faf8f4; --muted: #8a95a3; --border: #e4e2dd;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); }
        .serif { font-family: 'Instrument Serif', serif; }
        .navbar-grid::after {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .plan-btn-gold { background: var(--gold) !important; color: #0f1f3d !important; }
        .plan-btn-gold:hover { background: var(--gold-l) !important; }
        .popular-ring { border: 1px solid var(--gold) !important; box-shadow: 0 4px 30px rgba(201,168,76,0.18) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.19s; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar-grid sticky top-0 z-40 flex items-center justify-between px-10 h-16 relative overflow-hidden"
        style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[7px] flex items-center justify-center flex-shrink-0"
            style={{ border: '1.5px solid var(--gold)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="serif text-white text-base tracking-wide">Pasado</span>
        </div>
        <Link to="/dashboard"
          className="relative z-10 flex items-center gap-1.5 text-[13px] font-medium no-underline rounded-lg px-3.5 py-1.5 transition-all"
          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-14 pb-20 fade-up">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--gold-d)' }}>
            Subscription Plans
          </p>
          <h1 className="serif text-[40px] leading-tight" style={{ color: 'var(--navy)' }}>
            Choose Your <em className="not-italic" style={{ color: 'var(--gold)' }}>Plan</em>
          </h1>
          <div className="h-px w-14 mx-auto my-3.5"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Select the plan that best fits your claim volume. No rollover, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`bg-white rounded-[22px] flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 fade-up fade-up-${i + 1} ${plan.popular ? 'popular-ring' : ''}`}
              style={{
                border: plan.popular ? undefined : '1px solid var(--border)',
                boxShadow: plan.popular ? undefined : '0 2px 20px rgba(15,31,61,0.05)',
              }}>

              <div className="relative overflow-hidden px-7 pt-7 pb-6"
                style={{ background: plan.popular ? 'linear-gradient(135deg,#0f1f3d 0%,#1a3060 100%)' : 'var(--navy)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
                  backgroundSize: '32px 32px',
                }} />
                {plan.popular && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full z-10"
                    style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                    Most Popular
                  </div>
                )}
                <div className="relative z-10 w-9 h-9 rounded-[10px] flex items-center justify-center mb-3.5"
                  style={{ border: '1px solid rgba(201,168,76,0.35)' }}>
                  {plan.icon}
                </div>
                <div className="serif relative z-10 text-[22px] text-white mb-1">{plan.name}</div>
                <div className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{plan.tagline}</div>
              </div>

              <div className="px-7 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="serif text-sm mt-1" style={{ color: 'var(--gold-d)' }}>$</span>
                  <span className="serif text-[44px] leading-none" style={{ color: 'var(--navy)' }}>
                    {plan.price.split('.')[0]}
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                    .{plan.price.split('.')[1]} / month
                  </span>
                </div>
                <p className="text-[11.5px]" style={{ color: 'var(--muted)' }}>Billed monthly · No rollover</p>
              </div>

              <div className="px-7 py-5 flex-1">
                <ul className="flex flex-col gap-3">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-[13.5px]" style={{ color: 'var(--navy)' }}>
                      <CheckIcon />
                      <span>
                        {f.bold
                          ? <><strong className="font-semibold" style={{ color: 'var(--gold-d)' }}>{f.bold}</strong>{f.label.replace(f.bold, '')}</>
                          : f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full cursor-pointer text-white rounded-xl py-3.5 text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 ${plan.popular ? 'plan-btn-gold' : ''}`}
                  style={!plan.popular ? { background: 'var(--navy)' } : {}}>
                  Get Started
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-[11.5px] leading-relaxed" style={{ color: '#bbb' }}>
          All plans are billed monthly. Claims do not roll over to the next month.<br />
          We connect businesses with independent, licensed collection agencies and do not perform collection activities directly.
        </p>
      </div>

      {/* CHECKOUT MODAL */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}