import React, { useState, useEffect, useRef } from 'react';
import { runBatchChecks } from '../services/batchRunner';
import { exportBatchToExcel } from '../utils/exportToExcel';
import { groupResultsByResident } from '../utils/groupResultsByResident';
import ResidentReportTable from './ResidentReportTable';
import { saveAuditResults } from '../services/historyStorage';
import { hasAnyApiKey } from '../services/geminiClient';

export default function BatchMode({ pipelineInputs, onReset }) {
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [batchError, setBatchError] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const isCancelled = useRef(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startBatch();
    // Only set cancelled on genuine unmount (navigating away), not Strict Mode cleanup
    return () => {};
  }, []);

  const startBatch = async () => {
    isCancelled.current = false;
    setResults([]);
    setCurrentIndex(0);
    setCurrentLabel('');
    setBatchError(null);
    setSelectedResident(null);

    if (!hasAnyApiKey()) {
      setBatchError('No API key configured. Please set at least one API key in the API Configuration (⚙️ icon in the top-right corner) before running checks.');
      return;
    }

    setIsProcessing(true);

    try {
      const finalResults = await runBatchChecks(
        pipelineInputs,
        (done, total, input) => {
          setCurrentIndex(done);
          setCurrentLabel(input ? `${input.residentName} — Day ${input.dayNumber}` : '');
        },
        isCancelled
      );
      setResults(finalResults);
      // Save valid results to analytics history
      saveAuditResults(finalResults.filter(r => r.overall_status !== 'error'), 'batch');
    } catch (err) {
      setBatchError(err.message || 'Unexpected error during batch processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    exportBatchToExcel(results, pipelineInputs);
  };

  const progressPercentage = pipelineInputs.length > 0
    ? Math.round((currentIndex / pipelineInputs.length) * 100)
    : 0;

  const grouped = groupResultsByResident(results);
  const residentNames = Object.keys(grouped);
  const errorCount = results.filter(r => r.overall_status === 'error').length;

  // Auto-select first resident when results arrive
  useEffect(() => {
    if (residentNames.length > 0 && !selectedResident) {
      setSelectedResident(residentNames[0]);
    }
  }, [residentNames.length]);

  const getResidentStatus = (dayResults) => {
    const hasError = dayResults.some(d => d.overall_status === 'error' || d.status === 'error');
    if (hasError) return 'error';
    const hasFlags = dayResults.some(d => {
      const flags = d.flags || (d.data && d.data.flags) || [];
      return flags.some(f => f.flag_type === 'Missing' || f.flag_type === 'Incomplete' || f.flag_type === 'Vague');
    });
    if (hasFlags) return 'flagged';
    return 'complete';
  };

  return (
    <div className="batch-mode">
      <div className="batch-header">
        <h3>Batch Processing Results</h3>
        <div className="btn-group">
          {!isProcessing && results.length > 0 && (
            <button className="btn-secondary" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Results (.xlsx)
            </button>
          )}
          <button className="btn-secondary" onClick={onReset} disabled={isProcessing}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload Another
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="processing-card">
          <div className="circular-spinner"></div>
          <div className="processing-info">
            <div className="processing-title">
              Processing {currentIndex} of {pipelineInputs.length} notes… ({progressPercentage}%)
            </div>
            {currentLabel && (
              <div className="processing-current">
                Currently checking: {currentLabel}
              </div>
            )}
            <div className="batch-progress">
              <div className="batch-progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      )}

      {!isProcessing && batchError && (
        <div className="error-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <strong>Batch Error:</strong> {batchError}
        </div>
      )}

      {!isProcessing && results.length > 0 && (
        <div className={`completion-banner ${errorCount > 0 ? 'has-errors' : 'success'}`}>
          {errorCount > 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          <span>
            {errorCount > 0
              ? `Done with ${errorCount} error(s) — ${results.length - errorCount} of ${pipelineInputs.length} notes processed successfully`
              : `All ${pipelineInputs.length} notes checked successfully`
            }
          </span>
        </div>
      )}

      {/* Tabbed Resident Selector + Detail View */}
      {!isProcessing && results.length > 0 && residentNames.length > 0 && (
        <div className="resident-panel">
          {/* Sidebar — Resident list */}
          <div className="resident-sidebar">
            <div className="resident-sidebar-header">
              <span className="resident-sidebar-title">Residents</span>
              <span className="resident-sidebar-count">{residentNames.length}</span>
            </div>
            <div className="resident-sidebar-list">
              {residentNames.map((name, idx) => {
                const status = getResidentStatus(grouped[name]);
                return (
                  <button
                    key={name}
                    className={`resident-tab ${selectedResident === name ? 'active' : ''}`}
                    onClick={() => setSelectedResident(name)}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <span className={`resident-tab-dot resident-tab-dot--${status}`} />
                    <div className="resident-tab-info">
                      <span className="resident-tab-name">{name}</span>
                      <span className="resident-tab-meta">
                        {grouped[name].length} day{grouped[name].length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {selectedResident === name && (
                      <svg className="resident-tab-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content — Selected resident's report */}
          <div className="resident-detail">
            {selectedResident && grouped[selectedResident] && (
              <ResidentReportTable
                key={selectedResident}
                residentName={selectedResident}
                dayResults={grouped[selectedResident]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
