import { useState, useEffect } from 'react';
import { BASE_URL } from '../api/auth';

const STATUS_COLORS = {
  connection_approved: { bg: '#eafaf1', color: '#1e8449', border: '#a9dfbf', dot: '#27ae60' },
  connection_denied:   { bg: '#fdf0ef', color: '#c0392b', border: '#f1c0bc', dot: '#c0392b' },
  pending_admin:       { bg: '#fef9e7', color: '#9a7d0a', border: '#f9e79f', dot: '#f4d03f' },
  approved_by_agency:  { bg: '#e8f2fa', color: '#1669A9', border: '#c5ddf0', dot: '#1669A9' },
  assigned:            { bg: '#f3eefa', color: '#6c3ec1', border: '#d4bafc', dot: '#6c3ec1' },
};

const STATUS_LABELS = {
  connection_approved: 'Connection Approved',
  connection_denied:   'Connection Denied',
  pending_admin:       'Pending Admin Approval',
  approved_by_agency:  'Approved by Agency',
  in_progress:         'In Progress',
  assigned:            'Assigned',
};

const EMPTY_CLAIM_FORM = {
  debtor_type: 'individual',
  debtor_name: '',
  debtor_email: '',
  debtor_phone: '',
  debtor_address: '',
  amount: '',
  due_date: '',
  description: '',
  past_due_period: '',
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending_admin;
  const label = STATUS_LABELS[status] || status;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} style={{ padding: '16px 20px' }}>
          <div style={{ height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

function Spinner({ color = '#fff' }) {
  return (
    <span style={{
      width: 13, height: 13, border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`, borderRadius: '50%',
      display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

// ─── Shared form field ───────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a96a8' }}>
        {label}{required && <span style={{ color: '#c0392b', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: '9px 12px', border: '1.5px solid #e0e7ef', borderRadius: 8,
  fontSize: 13, fontFamily: 'inherit', color: '#1a2a3a',
  outline: 'none', background: '#f5f7fa', width: '100%', boxSizing: 'border-box',
};

// ─── Create Claim For User Modal ─────────────────────────────────
function CreateClaimForUserModal({ users, onClose, onSuccess, showToast }) {
  const [userId, setUserId]   = useState('');
  const [form, setForm]       = useState(EMPTY_CLAIM_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${BASE_URL}/admin/getUsers`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUsers(data.users || data || []);
      } catch { /* ignore */ } finally { setFetching(false); }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!userId) return showToast('Please select a user.', 'error');
    if (!form.debtor_name) return showToast('Debtor name is required.', 'error');
    if (!form.amount) return showToast('Amount is required.', 'error');

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE_URL}/admin/claims/create-for-user`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (data.claim) {
        showToast('Claim created for user successfully.');
        onSuccess();
        onClose();
      } else {
        showToast(data.message || 'Failed to create claim.', 'error');
      }
    } catch {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Create Claim for User" subtitle="Admin · New Claim" onClose={onClose} accentColor="#1669A9">
  <Field label="Select User" required>
  <select value={userId} onChange={e => setUserId(e.target.value)} style={inputStyle}>
    <option value="">— Choose a user —</option>
    {users.map(u => (
      <option key={u._id} value={u._id}>{u.business_name} ({u.email})</option>
    ))}
  </select>
</Field>

      <ClaimFormFields form={form} setForm={setForm} />

      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e0e7ef', background: '#f5f7fa', color: '#4a6070', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px 20px', borderRadius: 10, border: 'none', background: '#1669A9', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {loading ? <Spinner /> : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create Claim for User</>
          )}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Create Claim For Agency Modal ───────────────────────────────
function CreateClaimForAgencyModal({ users, agencies, onClose, onSuccess, showToast }) {
  const [userId, setUserId]     = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [form, setForm]         = useState(EMPTY_CLAIM_FORM);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const [uRes, aRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/getUsers`,    { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/admin/getAgencies`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const uData = await uRes.json();
        const aData = await aRes.json();
        setUsers(uData.users || uData || []);
        setAgencies(aData.agencies || aData || []);
      } catch { /* ignore */ } finally { setFetching(false); }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!userId)   return showToast('Please select a user.', 'error');
    if (!agencyId) return showToast('Please select an agency.', 'error');
    if (!form.debtor_name) return showToast('Debtor name is required.', 'error');
    if (!form.amount) return showToast('Amount is required.', 'error');

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE_URL}/admin/claims/create-for-agency`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, agency_id: agencyId, ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (data.claim) {
        showToast('Claim created and assigned to agency successfully.');
        onSuccess();
        onClose();
      } else {
        showToast(data.message || 'Failed to create claim.', 'error');
      }
    } catch {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Create Claim for Agency" subtitle="Admin · Direct Assignment" onClose={onClose} accentColor="#6c3ec1">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Select User" required>
          {fetching ? (
            <div style={{ ...inputStyle, color: '#7a96a8' }}>Loading…</div>
          ) : (
            <select value={userId} onChange={e => setUserId(e.target.value)} style={inputStyle}>
              <option value="">— Choose a user —</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.business_name} ({u.email})</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Select Agency" required>
          {fetching ? (
            <div style={{ ...inputStyle, color: '#7a96a8' }}>Loading…</div>
          ) : (
            <select value={agencyId} onChange={e => setAgencyId(e.target.value)} style={inputStyle}>
              <option value="">— Choose an agency —</option>
              {agencies.map(a => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <ClaimFormFields form={form} setForm={setForm} />

      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e0e7ef', background: '#f5f7fa', color: '#4a6070', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px 20px', borderRadius: 10, border: 'none', background: '#6c3ec1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {loading ? <Spinner /> : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create &amp; Assign to Agency</>
          )}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Shared claim form fields ─────────────────────────────────────
function ClaimFormFields({ form, setForm }) {
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Debtor Type" required>
          <select value={form.debtor_type} onChange={e => set('debtor_type', e.target.value)} style={inputStyle}>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </Field>
        <Field label="Debtor Name" required>
          <input value={form.debtor_name} onChange={e => set('debtor_name', e.target.value)} placeholder="Full name" style={inputStyle} />
        </Field>
        <Field label="Debtor Email">
          <input type="email" value={form.debtor_email} onChange={e => set('debtor_email', e.target.value)} placeholder="email@example.com" style={inputStyle} />
        </Field>
        <Field label="Debtor Phone">
          <input value={form.debtor_phone} onChange={e => set('debtor_phone', e.target.value)} placeholder="+1 (555) 000-0000" style={inputStyle} />
        </Field>
        <Field label="Amount Owed ($)" required>
          <input type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" style={inputStyle} />
        </Field>
        <Field label="Due Date">
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Past Due Period">
          <select value={form.past_due_period} onChange={e => set('past_due_period', e.target.value)} style={inputStyle}>
            <option value="">— Select —</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
            <option value="8_months">8 Months</option>
            <option value="9_months">9 Months</option>
          </select>
        </Field>
        <Field label="Debtor Address">
          <input value={form.debtor_address} onChange={e => set('debtor_address', e.target.value)} placeholder="Street, City, State" style={inputStyle} />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the debt…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
    </>
  );
}

// ─── Shared modal shell ───────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, accentColor, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e0e7ef',
        width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.25s cubic-bezier(.22,1,.36,1) both',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: accentColor, padding: '20px 24px', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{subtitle}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{title}</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Detail modal (unchanged) ────────────────────────────────────
function DetailModal({ claim, onClose, onApprove, onDeny, actionLoading }) {
  if (!claim) return null;
  const fmt = iso => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const fmtCur = n => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e0e7ef',
        width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.25s cubic-bezier(.22,1,.36,1) both',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ background: '#1669A9', padding: '20px 24px', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Claim Review</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Connection Decision</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={claim.status} />
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section title="Business" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}>
            <Row label="Business Name" value={claim.business?.business_name || claim.business_name || '—'} />
            <Row label="Contact" value={claim.business?.contact_name || '—'} />
            <Row label="Email" value={claim.business?.email || '—'} />
          </Section>
          <Section title="Agency" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
            <Row label="Agency Name" value={claim.agency?.name || '—'} />
            <Row label="States Covered" value={claim.agency?.states_covered?.join(', ') || '—'} />
            <Row label="Agency Approved On" value={fmt(claim.agency_approved_at || claim.updatedAt)} />
          </Section>
          <Section title="Claim Details" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}>
            <Row label="Debtor Name" value={claim.debtor_name || '—'} />
            <Row label="Debtor Type" value={claim.debtor_type === 'individual' ? 'Individual' : 'Business'} />
            <Row label="Amount Owed" value={fmtCur(claim.amount)} large />
            <Row label="Due Date" value={fmt(claim.due_date)} />
            <Row label="Description" value={claim.description || '—'} full />
          </Section>
          {(claim.status === 'pending_admin' || claim.status === 'approved_by_agency' || claim.status === 'in_progress' || claim.status === 'assigned') && (
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button onClick={() => onDeny(claim._id)} disabled={!!actionLoading} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: '1px solid #f1c0bc', background: '#fdf0ef', color: '#c0392b', fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {actionLoading === `deny-${claim._id}` ? <Spinner color="#c0392b" /> : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Deny Connection</>)}
              </button>
              <button onClick={() => onApprove(claim._id)} disabled={!!actionLoading} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', background: '#1669A9', color: '#fff', fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {actionLoading === `approve-${claim._id}` ? <Spinner color="#fff" /> : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Approve Connection</>)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ border: '1px solid #e0e7ef', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#1669A9', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', position: 'relative', zIndex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', background: '#fff' }}>{children}</div>
    </div>
  );
}

function Row({ label, value, large, full }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#7a96a8' }}>{label}</p>
      <p style={{ fontSize: large ? 22 : 13.5, fontWeight: large ? 700 : 500, color: '#1a2a3a', lineHeight: 1.4 }}>{value}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ClaimConnections() {
  const [claims, setClaims]               = useState([]);
  const [users, setUsers]                 = useState([]);
  const [agencies, setAgencies]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [filter, setFilter]               = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast]                 = useState(null);
  const [showCreateUser, setShowCreateUser]     = useState(false);
  const [showCreateAgency, setShowCreateAgency] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClaims = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE_URL}/admin/claims/pending-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClaims(data.claims || []);
      setUsers(data.users || []);
      setAgencies(data.agencies || []);
    } catch {
      setError('Failed to load claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleApprove = async (claimId) => {
    setActionLoading(`approve-${claimId}`);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE_URL}/admin/claims/${claimId}/approve-connection`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.claim) {
        setClaims(prev => prev.map(c => c._id === claimId ? { ...c, ...data.claim } : c));
        if (selectedClaim?._id === claimId) setSelectedClaim(prev => ({ ...prev, ...data.claim }));
        showToast('Connection approved — emails sent to both parties.');
      } else {
        showToast(data.message || 'Failed to approve.', 'error');
      }
    } catch {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeny = async (claimId) => {
    setActionLoading(`deny-${claimId}`);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE_URL}/admin/claims/${claimId}/deny-connection`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.claim) {
        setClaims(prev => prev.map(c => c._id === claimId ? { ...c, ...data.claim } : c));
        if (selectedClaim?._id === claimId) setSelectedClaim(prev => ({ ...prev, ...data.claim }));
        showToast('Connection denied — business has been notified.', 'error');
      } else {
        showToast(data.message || 'Failed to deny.', 'error');
      }
    } catch {
      showToast('Server error. Please try again.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const filtered = claims.filter(c => {
    const matchSearch =
      c.debtor_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.business?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.agency?.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pending')  return matchSearch && c.status !== 'connection_approved' && c.status !== 'connection_denied' && c.status !== 'denied';
    if (filter === 'approved') return matchSearch && c.status === 'connection_approved';
    if (filter === 'denied')   return matchSearch && c.status === 'connection_denied';
    return matchSearch;
  });

  const counts = {
    pending:  claims.filter(c => c.status !== 'connection_approved' && c.status !== 'connection_denied').length,
    approved: claims.filter(c => c.status === 'connection_approved').length,
    denied:   claims.filter(c => c.status === 'connection_denied').length,
  };

  const fmt    = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCur = n   => n  != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to   { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .cc-row:hover    { background: #f8fafc !important; }
        .cc-action:hover { opacity: 0.82; }
        .tab-btn:hover   { background: #f0f4f8; }
        .btn-user:hover   { background: #0f5189 !important; }
        .btn-agency:hover { background: #5a32a3 !important; }
      `}</style>

      <div style={{ padding: '28px 32px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f5f7fa' }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 99999,
            background: toast.type === 'error' ? '#fdf0ef' : '#eafaf1',
            border: `1px solid ${toast.type === 'error' ? '#f1c0bc' : '#a9dfbf'}`,
            color: toast.type === 'error' ? '#c0392b' : '#1e8449',
            padding: '12px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'slideIn 0.25s cubic-bezier(.22,1,.36,1) both',
            maxWidth: 360,
          }}>
            {toast.type === 'error'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            }
            {toast.msg}
          </div>
        )}

        {/* Page Header */}
        <div style={{ marginBottom: 28, animation: 'fadeUp 0.35s both', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1669A9', marginBottom: 6 }}>Admin Dashboard</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a2a3a', marginBottom: 4, lineHeight: 1.15 }}>Claim Connections</h1>
            <div style={{ width: 44, height: 3, background: '#1669A9', borderRadius: 2, marginBottom: 8 }} />
            <p style={{ fontSize: 13.5, color: '#7a96a8' }}>Review agency-approved claims and approve or deny the connection between businesses and agencies.</p>
          </div>

          {/* ── NEW: Create Claim Buttons ── */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button
              className="btn-user"
              onClick={() => setShowCreateUser(true)}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#1669A9', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(22,105,169,0.25)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
              Create Claim for User
            </button>
            <button
              className="btn-agency"
              onClick={() => setShowCreateAgency(true)}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#6c3ec1', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(108,62,193,0.25)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
              </svg>
              Create Claim for Agency
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24, animation: 'fadeUp 0.4s both' }}>
          {[
            { label: 'Awaiting Review', value: counts.pending,  color: '#9a7d0a', bg: '#fef9e7', border: '#f9e79f', dot: '#f4d03f' },
            { label: 'Approved',        value: counts.approved, color: '#1e8449', bg: '#eafaf1', border: '#a9dfbf', dot: '#27ae60' },
            { label: 'Denied',          value: counts.denied,   color: '#c0392b', bg: '#fdf0ef', border: '#f1c0bc', dot: '#c0392b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1a2a3a', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11.5, color: '#7a96a8', marginTop: 3 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.45s both' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'pending',  label: 'Awaiting Review' },
              { key: 'approved', label: 'Approved' },
              { key: 'denied',   label: 'Denied' },
              { key: 'all',      label: 'All' },
            ].map(t => (
              <button key={t.key} className="tab-btn" onClick={() => setFilter(t.key)} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid', borderColor: filter === t.key ? '#1669A9' : '#e0e7ef', background: filter === t.key ? '#e8f2fa' : 'transparent', color: filter === t.key ? '#1669A9' : '#7a96a8', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{t.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a96a8" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search by debtor, business, or agency…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1.5px solid #e0e7ef', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#1a2a3a', outline: 'none', background: '#f5f7fa' }} />
          </div>
          <button onClick={fetchClaims} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#fff', color: '#4a6070', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fdf0ef', border: '1px solid #f1c0bc', color: '#c0392b', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e0e7ef', borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.5s both' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f7fa', borderBottom: '1px solid #e0e7ef' }}>
                  {['Business', 'Debtor / Claim', 'Agency', 'Amount', 'Agency Approved', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#7a96a8', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4].map(i => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '56px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a96a8" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        </div>
                        <p style={{ fontSize: 14, color: '#7a96a8', fontStyle: 'italic' }}>No claims found</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(claim => (
                  <tr key={claim._id} className="cc-row" style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.12s', cursor: 'pointer' }} onClick={() => setSelectedClaim(claim)}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#1669A9,#0f5189)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          {(claim.business?.business_name || claim.business_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>{claim.business?.business_name || claim.business_name || '—'}</p>
                          <p style={{ fontSize: 11.5, color: '#7a96a8' }}>{claim.business?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>{claim.debtor_name || '—'}</p>
                      <p style={{ fontSize: 11.5, color: '#7a96a8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{claim.description || '—'}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1a2a3a' }}>{claim.agency?.name || '—'}</p>
                      <p style={{ fontSize: 11.5, color: '#7a96a8' }}>{claim.agency?.states_covered?.slice(0,3).join(', ') || '—'}{claim.agency?.states_covered?.length > 3 ? '…' : ''}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2a3a' }}>{fmtCur(claim.amount)}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 13, color: '#4a6070' }}>{fmt(claim.agency_approved_at || claim.updatedAt)}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(claim.status === 'pending_admin' || claim.status === 'approved_by_agency' || claim.status === 'in_progress' || claim.status === 'assigned') ? (
                          <>
                            <button className="cc-action" onClick={() => handleDeny(claim._id)} disabled={!!actionLoading} title="Deny Connection" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #f1c0bc', background: '#fdf0ef', color: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.55 : 1, transition: 'opacity 0.15s' }}>
                              {actionLoading === `deny-${claim._id}` ? <Spinner color="#c0392b" /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                            </button>
                            <button className="cc-action" onClick={() => handleApprove(claim._id)} disabled={!!actionLoading} title="Approve Connection" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#1669A9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.55 : 1, transition: 'opacity 0.15s' }}>
                              {actionLoading === `approve-${claim._id}` ? <Spinner color="#fff" /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: '#7a96a8', fontStyle: 'italic' }}>Resolved</span>
                        )}
                        <button className="cc-action" onClick={() => setSelectedClaim(claim)} title="View Details" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e0e7ef', background: '#f5f7fa', color: '#4a6070', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.15s' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f4f8', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12.5, color: '#7a96a8' }}>Showing {filtered.length} of {claims.length} claims</p>
              <p style={{ fontSize: 11.5, color: '#b0bec5' }}>Click any row to view full details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedClaim && (
        <DetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} onApprove={handleApprove} onDeny={handleDeny} actionLoading={actionLoading} />
      )}
    {showCreateUser && (
  <CreateClaimForUserModal users={users} onClose={() => setShowCreateUser(false)} onSuccess={fetchClaims} showToast={showToast} />
)}
{showCreateAgency && (
  <CreateClaimForAgencyModal users={users} agencies={agencies} onClose={() => setShowCreateAgency(false)} onSuccess={fetchClaims} showToast={showToast} />
)}
    </>
  );
}