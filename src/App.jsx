import React, { useState } from 'react';
import './App.css';
import { checkNote } from './services/checker';
import { SAMPLE_RESIDENTS } from './data/samples';
import { exportToTSV } from './utils/export';

import ExcelUploader from './components/ExcelUploader';
import ExtractionPreview from './components/ExtractionPreview';
import BatchMode from './components/BatchMode';
import ResidentReportTable from './components/ResidentReportTable';

function App() {
  const [activeTab, setActiveTab] = useState('single');
  
  // Single Check State
  const [note, setNote] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Excel Import State
  const [pipelineInputs, setPipelineInputs] = useState(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const handleCheck = async () => {
    if (!note || note.trim().length < 10) {
      setError('Note is too short (minimum 10 characters)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await checkNote(note, dayNumber);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to check note. The AI service may be temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (residentKey, day) => {
    setDayNumber(day);
    setNote(SAMPLE_RESIDENTS[residentKey].notes[`day${day}`]);
    setResult(null);
    setError(null);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const tsv = exportToTSV(result.flags, result.day);
    navigator.clipboard.writeText(tsv);
    alert('Copied to clipboard!');
  };

  const handleUploadSuccess = (inputs) => {
    setPipelineInputs(inputs);
    setIsProcessingBatch(false);
  };

  const handleRunAllChecks = (finalInputs) => {
    setPipelineInputs(finalInputs);
    setIsProcessingBatch(true);
  };

  const handleResetBatch = () => {
    setPipelineInputs(null);
    setIsProcessingBatch(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Falls Documentation Checker</h1>
        <p className="subtitle">Automated compliance checking for POL-FAL-001</p>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Check
        </button>
        <button 
          className={`tab ${activeTab === 'excel' ? 'active' : ''}`}
          onClick={() => setActiveTab('excel')}
        >
          Excel Import (Batch)
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="single-check-view">
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => loadSample('johnDoe', 1)}>Load John Doe (Day 1)</button>
            <button className="btn-secondary" onClick={() => loadSample('peterParker', 1)}>Load Peter Parker (Day 1)</button>
          </div>

          <div className="form-group">
            <label>Day Number</label>
            <select value={dayNumber} onChange={(e) => setDayNumber(Number(e.target.value))}>
              <option value={1}>Day 1 — Incident Report</option>
              <option value={2}>Day 2 — Continuation Note</option>
              <option value={3}>Day 3 — Closure Note</option>
            </select>
          </div>

          <div className="form-group">
            <label>Progress Note</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Paste the nurse's progress note here..."
            />
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <button onClick={handleCheck} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Check Note'}
          </button>

          {result && (
            <div className="results-container" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 10 }}>
                  <button className="btn-secondary" onClick={copyToClipboard}>Copy as Table (TSV)</button>
              </div>
              <ResidentReportTable 
                residentName="Single Check Result" 
                dayResults={[{ 
                  dayNumber: dayNumber, 
                  overall_status: result.overall_status, 
                  flags: result.flags 
                }]} 
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'excel' && (
        <div className="excel-import-view">
          {!pipelineInputs && (
            <ExcelUploader onUploadSuccess={handleUploadSuccess} />
          )}
          
          {pipelineInputs && !isProcessingBatch && (
            <ExtractionPreview 
              initialInputs={pipelineInputs} 
              onRunAll={handleRunAllChecks} 
            />
          )}

          {pipelineInputs && isProcessingBatch && (
            <BatchMode 
              pipelineInputs={pipelineInputs} 
              onReset={handleResetBatch} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
