import { useState, useEffect } from 'react';
import { BASE_URL } from '../api/auth';

const TERMS = [
  { id: 'not_agency',    text: 'Collection Connector is not a collection agency' },
  { id: 'not_collector', text: 'Collection Connector does not act as a debt collector' },
  { id: 'independent',   text: 'All collection services are performed by independent agencies' },
  { id: 'valid_claims',  text: 'Submitted claims are valid and enforceable' },
  { id: 'data_share',    text: 'Data may be shared with agencies' },
  { id: 'no_guarantee',  text: 'Recovery is not guaranteed' },
  { id: 'agree_all',     text: 'User agrees to all policies and terms' },
];

/**
 * TermsModal
 *
 * Props:
 *   isOpen      {boolean}  – controls visibility
 *   onClose     {fn}       – called when user dismisses (X or backdrop)
 *   onAccepted  {fn}       – called after successful API save
 *   userName    {string}   – pre-fill hint (contact_name from profile)
 *   authToken   {string}   – Bearer token for the PATCH request
 *   apiBase     {string}   – e.g. "https://api.example.com"  (default "")
 */
export default function TermsModal({
  isOpen,
  onClose,
  onAccepted,
  userName = '',
  authToken = '',
  apiBase = '',
}) {
  const [checked, setChecked]   = useState({});
  const [typedName, setTypedName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const allChecked = TERMS.every(t => checked[t.id]);
  const nameOk     = typedName.trim().length >= 2;
  const canSubmit  = allChecked && nameOk && !submitting;

  // reset whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setChecked({});
      setTypedName('');
      setError('');
      setDone(false);
    }
  }, [isOpen]);

  const toggle = (id) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const checkAll = () => {
    const allOn = TERMS.reduce((acc, t) => ({ ...acc, [t.id]: true }), {});
    setChecked(allOn);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/accept-terms`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          terms_accept:     true,
          signature_name:   typedName.trim(),
          accepted_at:      new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Server error');
      setDone(true);
      setTimeout(() => {
        onAccepted?.();
        onClose?.();
      }, 1600);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --navy:   #0f1f3d;
          --navy-2: #162847;
          --navy-3: #1e3259;
          --gold:   #c9a84c;
          --gold-l: #e2c97e;
          --gold-d: #a8883a;
          --cream:  #faf8f4;
          --muted:  #8a95a3;
          --border: #e4e2dd;
          --white:  #ffffff;
        }

        /* ── Overlay ── */
        .tm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 18, 35, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: tm-fade-in 0.2s ease both;
        }
        @keyframes tm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Card ── */
        .tm-card {
          background: var(--white);
          border-radius: 20px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 80px rgba(10,18,35,0.45), 0 0 0 1px rgba(201,168,76,0.1);
          animation: tm-slide-up 0.28s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes tm-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        /* ── Header ── */
        .tm-header {
          background: var(--navy);
          padding: 24px 28px 20px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tm-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .tm-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .tm-eyebrow {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 6px;
          font-family: 'DM Sans', sans-serif;
        }
        .tm-title {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          color: #fff;
          line-height: 1.15;
        }
        .tm-title em { color: var(--gold-l); font-style: italic; }
        .tm-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-top: 5px;
          font-family: 'DM Sans', sans-serif;
        }
        .tm-close {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tm-close:hover { background: rgba(255,255,255,0.13); color: #fff; }
        .tm-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 70%);
          margin-top: 18px;
          position: relative;
          z-index: 1;
        }

        /* ── Body ── */
        .tm-body {
          padding: 24px 28px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tm-body::-webkit-scrollbar { width: 4px; }
        .tm-body::-webkit-scrollbar-track { background: transparent; }
        .tm-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        /* ── Check-all row ── */
        .tm-check-all {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--cream);
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .tm-check-all-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
        }
        .tm-check-all-btn {
          font-size: 12px;
          font-weight: 600;
          color: var(--gold-d);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .tm-check-all-btn:hover { color: var(--navy); }

        /* ── Checklist ── */
        .tm-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tm-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          user-select: none;
        }
        .tm-item:hover { border-color: rgba(201,168,76,0.4); background: #fffdf8; }
        .tm-item.is-checked {
          border-color: rgba(201,168,76,0.5);
          background: linear-gradient(135deg, #fffdf5 0%, #fdfaf0 100%);
        }

        .tm-checkbox {
          width: 20px; height: 20px;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
          background: var(--white);
        }
        .tm-item.is-checked .tm-checkbox {
          background: var(--navy);
          border-color: var(--navy);
        }
        .tm-check-icon { opacity: 0; transition: opacity 0.1s; }
        .tm-item.is-checked .tm-check-icon { opacity: 1; }

        .tm-item-text {
          font-size: 13.5px;
          color: var(--navy);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.4;
        }

        /* ── Signature section ── */
        .tm-section-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 10px;
          font-family: 'DM Sans', sans-serif;
        }
        .tm-sig-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: flex-end;
        }
        .tm-input-wrap { display: flex; flex-direction: column; gap: 6px; }
        .tm-input-label {
          font-size: 12px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
        }
        .tm-input {
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'Instrument Serif', serif;
          color: var(--navy);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: var(--white);
          width: 100%;
        }
        .tm-input::placeholder { color: #c5c0b8; font-style: italic; }
        .tm-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }
        .tm-date-box {
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 11px 14px;
          background: var(--cream);
          text-align: center;
          flex-shrink: 0;
        }
        .tm-date-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 3px;
        }
        .tm-date-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--navy);
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        /* ── Error ── */
        .tm-error {
          font-size: 12.5px;
          color: #c0392b;
          background: #fdf0ee;
          border: 1px solid #f5c6c2;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Footer ── */
        .tm-footer {
          padding: 16px 28px 24px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          background: var(--white);
        }
        .tm-progress {
          height: 3px;
          background: var(--border);
          border-radius: 99px;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .tm-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold-d), var(--gold-l));
          border-radius: 99px;
          transition: width 0.35s cubic-bezier(.22,1,.36,1);
        }
        .tm-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .tm-progress-label {
          font-size: 12px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
        }
        .tm-progress-label strong { color: var(--navy); }

        .tm-btn-submit {
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .tm-btn-submit:hover:not(:disabled) {
          background: var(--navy-2);
          transform: translateY(-1px);
        }
        .tm-btn-submit:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .tm-btn-submit.is-gold {
          background: var(--gold);
          color: var(--navy);
        }
        .tm-btn-submit.is-gold:hover:not(:disabled) {
          background: var(--gold-l);
        }
        .tm-btn-submit.is-done {
          background: #27ae60;
          pointer-events: none;
        }

        /* ── Success overlay ── */
        .tm-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 52px 28px;
          text-align: center;
          animation: tm-fade-in 0.3s ease both;
        }
        .tm-success-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #eafaf1;
          border: 2px solid #a9dfbf;
          display: flex; align-items: center; justify-content: center;
        }
        .tm-success-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--navy);
        }
        .tm-success-sub {
          font-size: 13px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          max-width: 320px;
        }
      `}</style>

      {/* Overlay */}
      <div className="tm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
        <div className="tm-card" role="dialog" aria-modal="true" aria-labelledby="tm-title">

          {/* Header */}
          <div className="tm-header">
            <div className="tm-header-row">
              <div>
                <p className="tm-eyebrow">Legal Agreement</p>
                <h2 className="tm-title" id="tm-title">
                  Terms of <em>Service</em>
                </h2>
                <p className="tm-subtitle">Please review and acknowledge each item below.</p>
              </div>
              <button className="tm-close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="tm-divider" />
          </div>

          {done ? (
            /* ── Success state ── */
            <div className="tm-success">
              <div className="tm-success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="tm-success-title">Agreement Saved</h3>
              <p className="tm-success-sub">
                Your acceptance has been recorded and stored on your account.
              </p>
            </div>
          ) : (
            <>
              {/* Body */}
              <div className="tm-body">

                {/* Check-all shortcut */}
                <div className="tm-check-all">
                  <span className="tm-check-all-label">
                    {Object.values(checked).filter(Boolean).length} / {TERMS.length} acknowledged
                  </span>
                  <button className="tm-check-all-btn" onClick={checkAll}>
                    Select all
                  </button>
                </div>

                {/* Checklist */}
                <div className="tm-checklist">
                  {TERMS.map(term => (
                    <div
                      key={term.id}
                      className={`tm-item${checked[term.id] ? ' is-checked' : ''}`}
                      onClick={() => toggle(term.id)}
                      role="checkbox"
                      aria-checked={!!checked[term.id]}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggle(term.id)}
                    >
                      <div className="tm-checkbox">
                        <svg className="tm-check-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span className="tm-item-text">{term.text}</span>
                    </div>
                  ))}
                </div>

                {/* Signature */}
                <div>
                  <p className="tm-section-label">Electronic Signature</p>
                  <div className="tm-sig-grid">
                    <div className="tm-input-wrap">
                      <label className="tm-input-label" htmlFor="tm-name-input">
                        Type your full name to sign
                      </label>
                      <input
                        id="tm-name-input"
                        className="tm-input"
                        type="text"
                        placeholder={userName || 'Your full name…'}
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div className="tm-date-box">
                      <div className="tm-date-label">Date</div>
                      <div className="tm-date-value">{today}</div>
                    </div>
                  </div>
                </div>

                {error && <div className="tm-error">⚠ {error}</div>}

              </div>

              {/* Footer */}
              <div className="tm-footer">
                {/* Progress bar */}
                <div className="tm-progress">
                  <div
                    className="tm-progress-fill"
                    style={{
                      width: `${Math.round(
                        ((Object.values(checked).filter(Boolean).length / TERMS.length) * 0.7 +
                          (nameOk ? 0.3 : 0)) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="tm-footer-row">
                  <span className="tm-progress-label">
                    {!allChecked
                      ? <><strong>{TERMS.length - Object.values(checked).filter(Boolean).length}</strong> items remaining</>
                      : !nameOk
                      ? 'Add your signature to continue'
                      : <><strong>Ready</strong> to submit</>
                    }
                  </span>
                  <button
                    className={`tm-btn-submit${allChecked && nameOk ? ' is-gold' : ''}${done ? ' is-done' : ''}`}
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.8s linear infinite'}}>
                          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        I Agree & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>

              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          )}

        </div>
      </div>
    </>
  );
}