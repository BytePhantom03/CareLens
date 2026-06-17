import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roleConfig';
import './UserMenu.css';

export default function UserMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!session) return null;

  return (
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
            <button className="user-menu-logout-btn" onClick={() => setConfirmingLogout(true)}>Sign out</button>
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
  );
}
