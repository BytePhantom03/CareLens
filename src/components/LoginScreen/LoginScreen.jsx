import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useGoogleSignIn } from '../../auth/useGoogleSignIn';
import './LoginScreen.css';

export default function LoginScreen() {
  const { login } = useAuth();
  const buttonRef = useGoogleSignIn(login);

  return (
    <div className="login-screen" role="main" aria-label="CareLens sign-in page">
      {/* Animated background orbs */}
      <div className="login-orb login-orb--1" aria-hidden="true" />
      <div className="login-orb login-orb--2" aria-hidden="true" />
      <div className="login-orb login-orb--3" aria-hidden="true" />

      {/* ===== LEFT PANEL — Hero ===== */}
      <div className="login-hero" aria-hidden="true">
        <div className="login-hero-inner">
          {/* Product badge */}
          <div className="login-product-badge">
            <svg width="14" height="14" viewBox="0 0 48 46" fill="none">
              <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#818cf8"/>
            </svg>
            CareLens · AI Compliance Platform
          </div>

          {/* Hero headline */}
          <h1 className="login-hero-headline">
            Transform Clinical Documentation Audits with&nbsp;AI
          </h1>
          <p className="login-hero-sub">
            Automated policy compliance checking for aged care facilities. 
            Catch documentation gaps before they become audit findings.
          </p>

          {/* Feature bullets */}
          <div className="login-features">
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              Automated Compliance Reviews
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              Policy-Based Validation (POL-FAL-001)
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
              Audit-Ready Documentation
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              Real-Time Risk Detection
            </div>
          </div>

          {/* Analytics preview card */}
          <div className="login-preview-card">
            <div className="login-preview-header">
              <span className="login-preview-title">Compliance Dashboard</span>
              <span className="login-preview-badge">Live</span>
            </div>
            <div className="login-preview-metrics">
              <div className="login-metric">
                <div className="login-metric-value login-metric-value--green">94%</div>
                <div className="login-metric-label">Compliance</div>
              </div>
              <div className="login-metric">
                <div className="login-metric-value login-metric-value--amber">12</div>
                <div className="login-metric-label">Flags Today</div>
              </div>
              <div className="login-metric">
                <div className="login-metric-value login-metric-value--blue">847</div>
                <div className="login-metric-label">Notes Audited</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="login-form-panel">
        <div className="login-card login-card--animate-in" role="form" aria-label="Sign in to CareLens">
          {/* Logo */}
          <div className="login-icon-container">
            <div className="login-icon-wrap">
              <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-icon">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#8b5cf6"/>
              </svg>
            </div>
          </div>

          {/* Product name */}
          <div className="login-product-name">CareLens</div>

          {/* Welcome text */}
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">
            Sign in with your facility Google account to access the compliance dashboard
          </p>

          {/* Google Sign-In button — PRESERVED EXACTLY */}
          <div ref={buttonRef} className="google-button-slot login-card--animate-in-delayed" />

          {/* Divider */}
          <div className="login-divider" aria-hidden="true">
            <div className="login-divider-line" />
            <span className="login-divider-text">Secure Healthcare Authentication</span>
            <div className="login-divider-line" />
          </div>

          {/* Trust indicators */}
          <div className="login-trust">
            <div className="login-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Protected by Google Authentication</span>
            </div>
            <div className="login-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>End-to-end encrypted session</span>
            </div>
            <div className="login-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>HIPAA-aligned data handling</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          CareLens v1.0 · Falls Documentation Compliance<br />
          © {new Date().getFullYear()} CareLens Healthcare
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">CareLens sign-in page. Use the Google sign-in button to authenticate with your facility account.</span>
    </div>
  );
}
