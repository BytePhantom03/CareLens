import React, { useState, useEffect, useRef } from 'react';
import { runBatchChecks } from '../services/batchRunner';
import { exportBatchToExcel } from '../utils/exportToExcel';
import { groupResultsByResident } from '../utils/groupResultsByResident';
import ResidentReportTable from './ResidentReportTable';

export default function BatchMode({ pipelineInputs, onReset }) {
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [batchError, setBatchError] = useState(null);
  const isCancelled = useRef(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return; // guard against Strict Mode double-invoke
    hasStarted.current = true;
    startBatch();
    return () => { isCancelled.current = true; };
  }, []);

  const startBatch = async () => {
    isCancelled.current = false;
    setIsProcessing(true);
    setResults([]);
    setCurrentIndex(0);
    setCurrentLabel('');
    setBatchError(null);

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
    } catch (err) {
      setBatchError(err.message || 'Unexpected error during batch processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    exportBatchToExcel(results);
  };

  const progressPercentage = pipelineInputs.length > 0
    ? Math.round((currentIndex / pipelineInputs.length) * 100)
    : 0;

  const grouped = groupResultsByResident(results);
  const errorCount = results.filter(r => r.overall_status === 'error').length;

  return (
    <div className="batch-mode">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Batch Processing Results</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isProcessing && results.length > 0 && (
            <button className="btn-secondary" onClick={handleExport}>Download Results (.xlsx)</button>
          )}
          <button className="btn-secondary" onClick={onReset} disabled={isProcessing}>Upload Another</button>
        </div>
      </div>

      {/* Processing spinner */}
      {isProcessing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1.5rem', background: 'var(--surface)',
          borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem'
        }}>
          <div className="circular-spinner"></div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
              Processing {currentIndex} of {pipelineInputs.length} notes… ({progressPercentage}%)
            </div>
            {currentLabel && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                Currently checking: {currentLabel}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              Auto-retrying on rate limits — using Gemini → Groq fallback chain
            </div>
          </div>
        </div>
      )}

      {/* Batch-level fatal error */}
      {!isProcessing && batchError && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <strong>Batch Error:</strong> {batchError}
        </div>
      )}

      {/* Complete banner */}
      {!isProcessing && results.length > 0 && (
        <div className="progress-container" style={{ marginBottom: '1.5rem' }}>
          <div
            className="progress-bar-fill"
            style={{ width: '100%', background: errorCount > 0 ? 'var(--flag-vague-text)' : 'var(--flag-complete-text)' }}
          />
          <div className="progress-text-overlay" style={{ color: 'white' }}>
            {errorCount > 0
              ? `Done with ${errorCount} error(s) — ${results.length - errorCount} of ${pipelineInputs.length} notes processed successfully`
              : `✓ All ${pipelineInputs.length} notes checked successfully`
            }
          </div>
        </div>
      )}

      {/* Results tables */}
      {!isProcessing && results.length > 0 && (
        <div className="batch-tables" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([residentName, dayResults]) => (
            <ResidentReportTable
              key={residentName}
              residentName={residentName}
              dayResults={dayResults}
            />
          ))}
        </div>
      )}
    </div>
  );
}
