import React, { useState } from 'react';
import { ROLES } from '../../auth/roleConfig';
import { useAuth } from '../../auth/AuthContext';
import './RoleSelector.css';

const ROLE_DESCRIPTIONS = {
  nurse: 'Check your own progress notes before submitting to the RMS.',
  manager: 'Review facility-wide compliance, run batch checks, view trends.',
  quality: 'Audit documentation for accreditation readiness.'
};

export default function RoleSelector() {
  const { setRole } = useAuth();
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => setRole(selected), 450); // lets the checkmark animation play first
  }

  return (
    <div className="role-selector-overlay">
      <div className="role-selector-modal">
        <h2>Which best describes your role?</h2>
        <div className="role-cards">
          {Object.entries(ROLES).map(([key, { label }]) => (
            <button
              key={key}
              className={`role-card ${selected === key ? 'role-card--selected' : ''}`}
              onClick={() => setSelected(key)}
            >
              <div className="role-card-content">
                <span className="role-card-label">{label}</span>
                <span className="role-card-desc">{ROLE_DESCRIPTIONS[key]}</span>
              </div>
              {selected === key && (
                <span className="role-card-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          className="role-confirm-button"
          disabled={!selected || confirming}
          onClick={handleConfirm}
        >
          {confirming ? 'Setting up your workspace…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
