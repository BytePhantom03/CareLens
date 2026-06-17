import React, { useState, useEffect, useRef } from 'react';
import { checkNote } from '../services/checker';
import { exportBatchToExcel } from '../utils/exportToExcel';

export default function BatchMode({ pipelineInputs, onReset }) {
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isCancelled = useRef(false);

  useEffect(() => {
    startBatch();
    return () => { isCancelled.current = true; };
  }, []);

  const startBatch = async () => {
    setIsProcessing(true);
    const newResults = [];

    for (let i = 0; i < pipelineInputs.length; i++) {
      if (isCancelled.current) break;
      setCurrentIndex(i);
      const input = pipelineInputs[i];
      
      try {
        const res = await checkNote(input.progressNote, input.dayNumber);
        newResults.push({
          ...input,
          status: 'success',
          data: res
        });
      } catch (err) {
        newResults.push({
          ...input,
          status: 'error',
          error: err.message
        });
      }
      
      setResults([...newResults]);
      
      // Delay to avoid hitting rate limits (500ms delay as specified)
      if (i < pipelineInputs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsProcessing(false);
    if (!isCancelled.current) {
        setCurrentIndex(pipelineInputs.length);
    }
  };

  const handleExport = () => {
    exportBatchToExcel(results);
  };

  const progressPercentage = pipelineInputs.length > 0 
    ? Math.round((currentIndex / pipelineInputs.length) * 100) 
    : 0;

  return (
    <div className="batch-mode">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Batch Processing Results</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isProcessing && (
            <button className="btn-secondary" onClick={handleExport}>Download Results (.xlsx)</button>
          )}
          <button className="btn-secondary" onClick={onReset} disabled={isProcessing}>Upload Another</button>
        </div>
      </div>

      {isProcessing && (
        <div className="progress-container">
          <div 
            className="progress-bar-fill progress-bar-striped" 
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="progress-text-overlay">
            Processing {currentIndex} of {pipelineInputs.length} notes ({progressPercentage}%)
          </div>
        </div>
      )}
      
      {!isProcessing && results.length > 0 && (
         <div className="progress-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `100%`, background: 'var(--flag-complete-text)' }}
          />
          <div className="progress-text-overlay" style={{ color: 'white' }}>
            Check Complete! ({pipelineInputs.length} notes processed)
          </div>
        </div>
      )}

      <div className="batch-grid">
        {results.map((res, idx) => (
          <div key={idx} className="resident-card">
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{res.residentName} <span style={{ color: 'var(--text-light)', fontWeight: 'normal', fontSize: '0.9rem' }}>| Day {res.dayNumber}</span></h4>
            
            {res.status === 'error' ? (
              <div style={{ color: 'var(--flag-missing-text)' }}>Failed: {res.error}</div>
            ) : (
              <div>
                <div style={{ marginBottom: '0.5rem' }}>
                   <span className={`flag-badge flag-${res.data.overall_status === 'complete' ? 'complete' : 'missing'}`}>
                      {res.data.overall_status === 'complete' ? '✅ Complete' : '⚠️ Has Issues'}
                   </span>
                </div>
                {res.data.flags && res.data.flags.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <strong>{f.flag_type === 'Missing' ? '🚩 ' : f.flag_type === 'Vague' ? '⚠️ ' : '✅ '}{f.field}</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-light)' }}>{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
