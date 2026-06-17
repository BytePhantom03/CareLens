import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useGoogleSignIn } from '../../auth/useGoogleSignIn';
import './LoginScreen.css';

export default function LoginScreen() {
  const { login } = useAuth();
  const buttonRef = useGoogleSignIn(login);

  return (
    <div className="login-screen">
      <div className="login-card login-card--animate-in">
        <div className="login-icon-container">
            <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-icon">
              <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#8b5cf6"/>
            </svg>
        </div>
        <h1 className="login-title">Falls Documentation Checker</h1>
        <p className="login-subtitle">Sign in with your facility Google account to continue</p>
        <div ref={buttonRef} className="google-button-slot login-card--animate-in-delayed" />
      </div>
    </div>
  );
}
