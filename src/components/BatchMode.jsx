import React, { useState, useEffect, useRef } from 'react';
import { runBatchChecks } from '../services/batchRunner';
import { exportBatchToExcel } from '../utils/exportToExcel';
import { groupResultsByResident } from '../utils/groupResultsByResident';
import ResidentReportTable from './ResidentReportTable';

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
    setResults([]);
    setCurrentIndex(0);

    const finalResults = await runBatchChecks(pipelineInputs, (done, total, input) => {
      setCurrentIndex(done);
    }, isCancelled);
    
    setResults(finalResults);
    setIsProcessing(false);
  };

  const handleExport = () => {
    exportBatchToExcel(results);
  };

  const progressPercentage = pipelineInputs.length > 0 
    ? Math.round((currentIndex / pipelineInputs.length) * 100) 
    : 0;

  const grouped = groupResultsByResident(results);

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
