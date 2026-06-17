import React, { useState, useEffect, useRef } from 'react';
import { getAuditHistory, clearHistory } from '../../services/historyStorage';
import './AnalyticsDashboard.css';

/* Simple animated counter hook — visual-only, no logic change */
function useAnimatedCounter(target, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
}

export default function AnalyticsDashboard() {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    totalAudits: 0,
    complianceScore: 0,
    topMissingFields: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getAuditHistory();
    setHistory(data);
    calculateMetrics(data);
  };

  const calculateMetrics = (data) => {
    if (!data || data.length === 0) {
      setMetrics({ totalAudits: 0, complianceScore: 0, topMissingFields: [] });
      return;
    }

    let completeCount = 0;
    const missingCounts = {};

    data.forEach(audit => {
      if (audit.overall_status === 'complete') {
        completeCount++;
      } else if (audit.flags) {
        audit.flags.forEach(flag => {
          if (flag.flag_type !== 'Complete') {
            missingCounts[flag.field] = (missingCounts[flag.field] || 0) + 1;
          }
        });
      }
    });

    const score = Math.round((completeCount / data.length) * 100);

    const sortedMissing = Object.entries(missingCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setMetrics({
      totalAudits: data.length,
      complianceScore: score,
      topMissingFields: sortedMissing
    });
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all audit history? This cannot be undone.')) {
      clearHistory();
      loadData();
    }
  };

  const animatedTotal = useAnimatedCounter(metrics.totalAudits);
  const animatedScore = useAnimatedCounter(metrics.complianceScore);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>Facility Compliance Analytics</h2>
          <p className="analytics-subtitle">Real-time insights from your documentation audits</p>
        </div>
        <button className="btn-secondary clear-btn" onClick={handleClear} disabled={history.length === 0}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Clear History
        </button>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h3 className="empty-state-title">No audit data yet</h3>
          <p className="empty-state-desc">Run Single Checks or Batch Imports to start tracking compliance trends across your facility.</p>
          <div className="empty-state-hints">
            <span className="empty-state-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Single Check
            </span>
            <span className="empty-state-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Excel Import
            </span>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Top Cards */}
          <div className="metrics-cards">
            <div className="metric-card">
              <div className="metric-icon blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Total Audits</h3>
                <div className="metric-value">{animatedTotal}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className={`metric-icon ${metrics.complianceScore >= 80 ? 'green' : metrics.complianceScore >= 50 ? 'orange' : 'red'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Overall Compliance</h3>
                <div className="metric-value">{animatedScore}<span className="metric-unit">%</span></div>
              </div>
            </div>

            <div className="metric-card">
              <div className={`metric-icon ${metrics.topMissingFields.length === 0 ? 'green' : 'orange'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Active Flags</h3>
                <div className="metric-value">{metrics.topMissingFields.reduce((sum, f) => sum + f.count, 0)}</div>
              </div>
            </div>
          </div>

          {/* Top Missing Fields */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Top Missing Policy Fields</h3>
              <span className="section-badge">{metrics.topMissingFields.length} fields</span>
            </div>
            {metrics.topMissingFields.length === 0 ? (
              <p className="perfect-score">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Incredible! No missing fields recorded.
              </p>
            ) : (
              <div className="bar-chart">
                {metrics.topMissingFields.map((item, idx) => {
                  const maxCount = metrics.topMissingFields[0].count;
                  const widthPct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div className="bar-row" key={idx} style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="bar-label">
                        <span className="field-name">{item.field}</span>
                        <span className="field-count">{item.count} flag{item.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${widthPct}%`, animationDelay: `${idx * 0.1 + 0.2}s` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
