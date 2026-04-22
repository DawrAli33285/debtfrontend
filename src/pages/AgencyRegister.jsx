import { useState,useRef } from 'react';
import { registerAgency } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const MSA_TEXT = `MASTER SERVICES AGREEMENT (MSA)
Collections Connection Platform

This Master Services Agreement ("Agreement") is entered into by and between Collections Connection ("Company") and the undersigned Collection Agency ("Agency") as of the Effective Date.

1. Scope of Services
Company operates a platform that facilitates the submission, management, and tracking of claims for collection. Agency agrees to utilize the Platform in accordance with this Agreement and all applicable laws and regulations.

2. Platform Fee
2.1 Fee Structure Company shall assess and retain a service fee equal to three percent (3%) of all funds recovered by Agency on claims submitted through the Platform.
2.2 Calculation of Fee The fee shall be calculated based on the gross amount recovered, prior to any deductions, fees, or offsets applied by Agency.
2.3 Applicability The fee applies to all claims submitted, sourced, or managed through the Platform, regardless of the method or timing of recovery.
2.4 No Recovery – No Fee No fee shall be owed for claims where no funds are recovered.

3. Payment Terms
3.1 Remittance Obligation Agency shall remit all applicable Platform fees to Company within:
  · Net 7 days from the date of recovery; or
  · Net 15 days if expressly agreed to in writing.
3.2 Method of Payment Company may, at its discretion:
  · Deduct its fee directly from recovered funds prior to disbursement; or
  · Invoice Agency for amounts due.
3.3 Late Payments Any unpaid amounts beyond the applicable payment period may be subject to:
  · Interest at the rate of 1.5% per month (or the maximum permitted by law), and
  · Suspension of Platform access until payment is made.

4. Reporting Requirements
Agency shall maintain accurate, complete, and timely records of all claim activity and recoveries, including:
  · Amounts collected
  · Dates of recovery
  · Payment status
Agency agrees to provide such reporting to Company upon request or through Platform integration.

5. Audit Rights
5.1 Right to Audit Company reserves the right to audit Agency's books and records relating to claims processed through the Platform.
5.2 Audit Scope Audits may include review of:
  · Collection records
  · Payment receipts
  · Internal accounting systems related to Platform claims
5.3 Notice & Frequency Audits shall be conducted upon reasonable notice and no more than twice per calendar year, unless discrepancies are identified.
5.4 Discrepancies If an audit reveals underpayment of fees:
  · Agency shall remit the outstanding balance immediately
  · If discrepancy exceeds 5%, Agency shall reimburse reasonable audit costs

6. Compliance
Agency agrees to comply with all applicable federal, state, and local laws, including but not limited to:
  · Fair Debt Collection Practices Act (FDCPA)
  · State collection regulations
Agency is solely responsible for its collection practices.

7. Term & Termination
7.1 Term This Agreement shall remain in effect until terminated by either party.
7.2 Termination Either party may terminate with written notice. Company may suspend or terminate access immediately for:
  · Non-payment
  · Breach of terms
  · Legal or compliance concerns

8. Limitation of Liability
Company shall not be liable for:
  · Agency's collection outcomes
  · Debtor disputes
  · Regulatory actions arising from Agency conduct

9. Miscellaneous
  · This Agreement constitutes the entire agreement between the parties
  · Any modifications must be in writing
  · This Agreement shall be governed by the laws of the State of Indiana`;

function MSAModal({ onAccept, onDecline }) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked]   = useState(false);
  const bodyRef = useRef(null);

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setScrolled(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(15,40,70,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 580, background: '#fff',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        animation: 'fadeUp 0.3s cubic-bezier(.22,1,.36,1) both',
      }}>

        {/* Header */}
        <div style={{
          background: '#1669A9', padding: '20px 24px', flexShrink: 0,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}/>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4, position: 'relative', zIndex: 1 }}>
            Required Agreement
          </p>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: '#fff', position: 'relative', zIndex: 1 }}>
            Agency Fee &amp; Participation Agreement
          </p>
        </div>

        {/* Scroll hint */}
        {!scrolled && (
          <div style={{
            background: '#fff8e1', borderBottom: '1px solid #ffe082',
            padding: '8px 20px', fontSize: 12, color: '#7a6000',
            display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Please scroll to the bottom to enable acceptance
          </div>
        )}

        {/* Body */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto', padding: '20px 24px',
            fontSize: 13, lineHeight: 1.75, color: '#2a3a4a',
            whiteSpace: 'pre-wrap', fontFamily: 'inherit',
            borderBottom: '1px solid #e0e7ef',
          }}
        >
          {MSA_TEXT}
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 24px', flexShrink: 0 }}>

          {/* Checkbox */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: 16, cursor: scrolled ? 'pointer' : 'not-allowed',
            opacity: scrolled ? 1 : 0.45,
          }}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!scrolled}
              onChange={e => setChecked(e.target.checked)}
              style={{ marginTop: 2, width: 15, height: 15, accentColor: '#1669A9', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12.5, color: '#4a6070', lineHeight: 1.55 }}>
              I have read and agree to the Collections Connection Agency Fee &amp; Participation Agreement
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onDecline}
              style={{
                flex: '0 0 auto', padding: '11px 20px',
                border: '1.5px solid #e0e7ef', borderRadius: 8,
                background: 'transparent', fontSize: 13.5, fontWeight: 600,
                color: '#7a96a8', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!checked || !scrolled}
              style={{
                flex: 1, padding: '11px 20px',
                border: 'none', borderRadius: 8,
                background: checked && scrolled ? '#1669A9' : '#c5ddf0',
                color: '#fff', fontSize: 13.5, fontWeight: 600,
                cursor: checked && scrolled ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              Accept &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const [step, setStep]     = useState(1);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [agency, setAgency] = useState({
    agency_name:        '',
    fee_percentage:     '',
    states_covered:     [],
    ein:                '',
    specialties:        [],
    upfront_fee:        null,
    upfront_fee_amount: '',
  });
  

  const [owner, setOwner] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
  });

  const [agreed, setAgreed]   = useState(false);
  const [showMSA, setShowMSA] = useState(false);
  const msaAccepted = useRef(false);

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
  
    // Show MSA modal first if not yet accepted
    if (!msaAccepted.current) {
      setShowMSA(true);
      return;
    }
  
    setLoading(true);
    const res = await registerAgency({
      agency_name:    agency.agency_name.trim(),
      ein:            agency.ein.trim(),
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
      navigate('/agency/subscription');
    } else {
      setError(res.message || 'Registration failed');
    }
  };


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

        .ar-root {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--off-white);
        }

        /* ── Left panel ── */
        .ar-left {
          display: none;
          width: 42%;
          background: var(--blue);
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
            radial-gradient(ellipse 70% 55% at 20% 100%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 10%,  rgba(255,255,255,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .ar-left::after {
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
        .logo-mark svg { width: 18px; height: 18px; }
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

        /* Step tracker */
        .step-track { position: relative; z-index: 1; }
        .step-track-title {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 16px;
        }
        .step-item {
          display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
        }
        .step-circle {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          transition: all 0.3s;
        }
        .step-circle.active   { background: rgba(255,255,255,0.95); color: var(--blue); }
        .step-circle.done     { background: rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); border: 1.5px solid rgba(255,255,255,0.4); }
        .step-circle.inactive { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.15); }
        .step-label { font-size: 13.5px; color: rgba(255,255,255,0.55); }
        .step-label.active { color: #fff; font-weight: 500; }

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
        .ar-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .ar-card {
          width: 100%;
          max-width: 480px;
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

        /* Mobile step dots */
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
        .ms-dot.active { background: var(--blue); }
        .ms-dot.done   { background: var(--blue-mid); }

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
        .card-sub { font-size: 13.5px; color: var(--text-muted); }

        .err-box {
          background: #fdf0ef;
          border: 1px solid #f1c0bc;
          color: var(--error);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        /* fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; margin-top: 28px; }
        .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

        .field label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 7px;
        }
        .field input {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: inherit;
          color: var(--text);
          background: var(--white);
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .field input::placeholder { color: #bbb; }
        .field input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(22,105,169,0.1);
        }
        .field-hint { font-size: 11.5px; color: var(--text-muted); margin-top: 5px; }

        .input-suffix-wrap { position: relative; }
        .input-suffix-wrap input { padding-right: 36px; }
        .input-suffix {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px; color: var(--text-muted); pointer-events: none;
        }

        /* tag pickers */
        .tag-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;
        }
        .tag-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 4px; }
        .tag {
          padding: 5px 11px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
          border: 1.5px solid var(--border);
          background: var(--white); color: var(--text-muted);
          cursor: pointer; transition: all 0.14s; user-select: none;
        }
        .tag:hover   { border-color: var(--blue-mid); color: var(--text); }
        .tag.selected { background: var(--blue); border-color: var(--blue); color: var(--white); }

        .states-grid {
          display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px;
          margin-bottom: 4px;
        }
        @media (max-width: 480px) { .states-grid { grid-template-columns: repeat(6, 1fr); } }
        .state-btn {
          padding: 5px 0; border-radius: 6px; text-align: center;
          font-size: 11px; font-weight: 600;
          border: 1.5px solid var(--border);
          background: var(--white); color: var(--text-muted);
          cursor: pointer; transition: all 0.12s; user-select: none;
        }
        .state-btn:hover   { border-color: var(--blue-mid); color: var(--text); }
        .state-btn.selected { background: var(--blue); border-color: var(--blue); color: var(--white); }

        .select-all-btn {
          font-size: 11.5px; font-weight: 600; color: var(--blue);
          background: none; border: none; cursor: pointer;
          padding: 0; text-decoration: underline; text-underline-offset: 2px;
          margin-bottom: 8px; font-family: inherit;
        }
        .select-all-btn:hover { color: var(--blue-dark); }

        /* agree */
        .agree-row {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 26px;
        }
        .agree-row input[type="checkbox"] {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;
          accent-color: var(--blue); cursor: pointer;
        }
        .agree-row label { font-size: 12px; line-height: 1.6; color: var(--text-muted); cursor: pointer; }
        .agree-row label a { color: var(--blue); text-decoration: underline; }

        /* buttons */
        .btn-row { display: flex; gap: 10px; }
        .btn-back {
          flex: 0 0 auto;
          background: transparent; border: 1.5px solid var(--border);
          border-radius: 8px; padding: 12px 18px;
          font-size: 14px; font-family: inherit;
          font-weight: 600; color: var(--text-muted);
          cursor: pointer; transition: border-color 0.15s, color 0.15s;
        }
        .btn-back:hover { border-color: var(--blue); color: var(--blue); }

        .btn-submit {
          flex: 1;
          background: var(--blue); color: #fff; border: none;
          border-radius: 8px; padding: 13px;
          font-size: 14px; font-family: inherit;
          font-weight: 600; letter-spacing: 0.03em;
          cursor: pointer; transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
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

        .signin-link {
          text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 22px;
        }
        .signin-link a { color: var(--blue); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }

        @media (max-width: 600px) {
          .ar-right { padding: 32px 16px; }
        }
      `}</style>

      <div className="ar-root">

        {/* ── Left panel ── */}
        <aside className="ar-left">
          <div className="left-brand">
           
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

          {/* Pills */}
          <div className="left-pills">
            {[
              {
                label: 'Pre-qualified claim matching',
                desc: 'Receive cases matched to your specialties',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: 'Transparent fee structure',
                desc: 'No hidden costs, no bidding wars',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: 'Real-time assignment dashboard',
                desc: 'Track every active case instantly',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
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
        <main className="ar-right">
          <div className="ar-card">

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
            <div className="header-rule" />
            <p className="card-sub">
              {step === 1
                ? 'Tell us about your agency so we can match you with the right claims.'
                : "Set up the owner account you'll use to access the agency dashboard."
              }
            </p>

            <div>
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

                    <div className="field">
                      <label htmlFor="ein">Business EIN</label>
                      <input
                        id="ein"
                        type="text"
                        value={agency.ein}
                        onChange={e => setAgency({...agency, ein: e.target.value})}
                        required
                        placeholder="XX-XXXXXXX"
                        maxLength={10}
                      />
                      <p className="field-hint">Your IRS-issued Employer Identification Number</p>
                    </div>

                    {/* Upfront Fee */}
                    <div>
                      <p className="tag-label">Upfront Fee</p>
                      <div style={{
                        border: '1.5px solid var(--border)',
                        borderRadius: 10,
                        padding: '14px 16px',
                        background: 'var(--white)',
                      }}>
                        <p style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, marginBottom: 12 }}>
                          Do you charge an upfront fee for your services?
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginBottom: agency.upfront_fee ? 14 : 0 }}>
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAgency(prev => ({
                                ...prev,
                                upfront_fee: opt === 'Yes',
                                upfront_fee_amount: opt === 'No' ? '' : prev.upfront_fee_amount,
                              }))}
                              style={{
                                flex: 1, padding: '9px 0', borderRadius: 8,
                                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                                border: agency.upfront_fee === (opt === 'Yes')
                                  ? '1.5px solid var(--blue)'
                                  : '1.5px solid var(--border)',
                                background: agency.upfront_fee === (opt === 'Yes')
                                  ? 'var(--blue-light)'
                                  : 'var(--off-white)',
                                color: agency.upfront_fee === (opt === 'Yes')
                                  ? 'var(--blue)'
                                  : 'var(--text-muted)',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {agency.upfront_fee && (
                          <div className="field" style={{ marginTop: 0 }}>
                            <label htmlFor="upfront_amount">Upfront Fee Amount</label>
                            <div className="input-suffix-wrap">
                              <input
                                id="upfront_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={agency.upfront_fee_amount || ''}
                                onChange={e => setAgency({ ...agency, upfront_fee_amount: e.target.value })}
                              />
                              <span className="input-suffix">$</span>
                            </div>
                            <p className="field-hint">The fixed amount charged before collection begins</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specialties */}

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

                  <button type="submit" className="btn-submit" style={{width:'100%'}}>
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

      {showMSA && (
        <MSAModal
        onAccept={() => {
          msaAccepted.current = true;
          setShowMSA(false);
          setLoading(true);
          registerAgency({
            agency_name:       agency.agency_name.trim(),
            ein:               agency.ein.trim(),
            fee_percentage:    parseFloat(agency.fee_percentage) || 0,
            states_covered:    agency.states_covered,
            specialties:       agency.specialties,
            name:              owner.name.trim(),
            email:             owner.email.trim(),
            password:          owner.password,
            agreement_version: 'v1.0',  
          }).then(res => {
              setLoading(false);
              if (res.token) {
                localStorage.setItem('agencyToken', res.token);
                navigate('/agency/subscription');
              } else {
                setError(res.message || 'Registration failed');
              }
            });
          }}
          onDecline={() => setShowMSA(false)}
        />
      )}

    </>
  );
}