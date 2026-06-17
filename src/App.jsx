import React, { useState } from 'react';
import './App.css';
import { checkNote } from './services/checker';
import { SAMPLE_RESIDENTS } from './data/samples';
import { exportToTSV } from './utils/export';

function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [note, setNote] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
          className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          Batch Mode
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
            <div className="results-container">
              <div className="results-header">
                <h3>Check Results: {result.day}</h3>
                <div>
                  <span className={`flag-badge flag-${result.overall_status === 'complete' ? 'complete' : 'missing'}`} style={{ marginRight: '1rem' }}>
                    {result.overall_status === 'complete' ? '✅ Complete' : '⚠️ Has Issues'}
                  </span>
                  <button className="btn-secondary" onClick={copyToClipboard}>Copy as Table</button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Flag Type</th>
                    <th>Field</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {result.flags.map((flag, idx) => (
                    <tr key={idx} className="flag-row">
                      <td>
                        <span className={`flag-badge flag-${flag.flag_type.toLowerCase()}`}>
                          {flag.flag_type === 'Missing' && '🚩 '}
                          {flag.flag_type === 'Vague' && '⚠️ '}
                          {flag.flag_type === 'Complete' && '✅ '}
                          {flag.flag_type}
                        </span>
                      </td>
                      <td>{flag.field}</td>
                      <td>{flag.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'batch' && (
        <div>
          <p>Batch Mode is under development.</p>
        </div>
      )}
    </div>
  );
}

export default App;
