import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import ApiSettingsModal from '../ApiSettingsModal/ApiSettingsModal';
import './UserMenu.css';

export default function UserMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!session) return null;

  return (
    <>
      <div className="user-menu">
        <button className="user-menu-trigger" onClick={() => setOpen(o => !o)}>
          <img src={session.picture} alt="" className="user-avatar" />
          <span>{session.name}</span>
        </button>
        {open && (
          <div className="user-menu-dropdown">
            <div className="user-menu-email">{session.email}</div>
            <div className="user-menu-role-badge">{ROLES[session.role]?.label}</div>
            
            {!confirmingLogout ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className="user-menu-action-btn" 
                  onClick={() => { setShowSettings(true); setOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5rem'}}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  API Keys Configuration
                </button>
                <button className="user-menu-logout-btn" onClick={() => setConfirmingLogout(true)}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className="logout-confirm">
                <span className="logout-confirm-text">Sign out of Falls Checker?</span>
                <div className="logout-confirm-actions">
                  <button className="btn-secondary" onClick={() => setConfirmingLogout(false)}>Cancel</button>
                  <button className="logout-confirm-btn" onClick={logout}>Yes, sign out</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showSettings && (
        <ApiSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
