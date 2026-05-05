import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { BASE_URL } from '../api/auth';

const PopupShow = () => {
  const [deniedClaim, setDeniedClaim] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchDeniedClaim = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/claims/getClaimsDeniedByAdmin`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.claim) {
          setDeniedClaim(res.data.claim);
          setShowPopup(true);
        }
      } catch (err) {
        console.error('Failed to fetch denied claim:', err);
      }
    };
    fetchDeniedClaim();
  }, []);

  const dismissPopup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/claims/${deniedClaim._id}/updateClaimPopup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to update claim:', err);
    } finally {
      setShowPopup(false);
    }
  };

  if (!showPopup || !deniedClaim) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '380px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        fontFamily: 'inherit',
      }}>

        {/* Red top bar */}
        <div style={{ height: '3px', background: '#ef4444' }} />

        {/* Header */}
        <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#fef2f2', border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#b91c1c', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Claim denied
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 10px', lineHeight: 1.3 }}>
            Connection not approved
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            This agency match didn't meet the required criteria. Reassign your claim or update and resubmit.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f3f4f6', margin: '0 28px' }} />

        {/* Claim details */}
        <div style={{ padding: '20px 28px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>
            Claim details
          </p>
          {[
            { label: 'Debtor', value: deniedClaim.debtor_name || 'N/A' },
            { label: 'Amount', value: `$${deniedClaim.amount?.toLocaleString() || 'N/A'}` },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 12px',
              borderRadius: 100, background: '#fef2f2',
              color: '#b91c1c', border: '1px solid #fecaca',
            }}>
              {deniedClaim.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f3f4f6', margin: '0 28px' }} />

        {/* Actions — OK & Cancel both call dismissPopup */}
        <div style={{ padding: '20px 28px 24px', display: 'flex', gap: 10 }}>
          <button
            onClick={dismissPopup}
            style={{
              flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 500,
              color: '#374151', background: '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={dismissPopup}
            style={{
              flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 600,
              color: '#fff', background: '#ef4444',
              border: 'none', borderRadius: 12, cursor: 'pointer',
            }}
          >
            OK
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default PopupShow;