import React, { useState, useEffect } from 'react';
import { getAuditHistory, clearHistory } from '../../services/historyStorage';
import './AnalyticsDashboard.css';

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

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Facility Compliance Analytics</h2>
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <p>No audit data available. Run Single Checks or Batch Imports to see metrics.</p>
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
                <div className="metric-value">{metrics.totalAudits}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className={`metric-icon ${metrics.complianceScore >= 80 ? 'green' : metrics.complianceScore >= 50 ? 'orange' : 'red'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Overall Compliance</h3>
                <div className="metric-value">{metrics.complianceScore}%</div>
              </div>
            </div>
          </div>

          {/* Top Missing Fields */}
          <div className="dashboard-section">
            <h3>Top Missing Policy Fields</h3>
            {metrics.topMissingFields.length === 0 ? (
              <p className="perfect-score">Incredible! No missing fields recorded.</p>
            ) : (
              <div className="bar-chart">
                {metrics.topMissingFields.map((item, idx) => {
                  const maxCount = metrics.topMissingFields[0].count;
                  const widthPct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div className="bar-row" key={idx}>
                      <div className="bar-label">
                        <span className="field-name">{item.field}</span>
                        <span className="field-count">{item.count} flags</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${widthPct}%` }}></div>
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
