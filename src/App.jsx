import React, { useState } from 'react';
import './App.css';
import { checkNote } from './services/checker';
import { SAMPLE_RESIDENTS } from './data/samples';
import { exportToTSV } from './utils/export';

import ExcelUploader from './components/ExcelUploader';
import ExtractionPreview from './components/ExtractionPreview';
import BatchMode from './components/BatchMode';
import ResidentReportTable from './components/ResidentReportTable';

import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RoleSelector from './components/RoleSelector/RoleSelector';
import UserMenu from './components/UserMenu/UserMenu';
import { ROLES } from './auth/roleConfig';

function AuthGate({ children }) {
  const { isAuthenticated, session } = useAuth();
  if (!isAuthenticated) return <LoginScreen />;
  if (!session.role) return <RoleSelector />;
  return children;
}

function AppShell() {
  const { session } = useAuth();
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

  // Toast notification state
  const [showToast, setShowToast] = useState(false);

  const allowedTabs = session && session.role && ROLES[session.role] ? ROLES[session.role].tabs : ['single'];

  // If activeTab is not allowed, switch to the first allowed tab
  if (!allowedTabs.includes(activeTab) && allowedTabs.length > 0) {
    setActiveTab(allowedTabs[0]);
  }

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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
        <h1>
          <span className="header-icon">
            <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="#8b5cf6"/>
            </svg>
          </span>
          Falls Documentation Checker
        </h1>
        <p className="subtitle">Automated compliance checking powered by AI</p>
        <div className="policy-badge">POL-FAL-001 · v1.0</div>
        <UserMenu />
      </header>

      <div className="tabs">
        {allowedTabs.includes('single') && (
          <button 
            className={`tab ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.4rem'}}>
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Single Check
          </button>
        )}
        
        {(allowedTabs.includes('batch') || allowedTabs.includes('excelImport')) && (
          <button 
            className={`tab ${activeTab === 'excel' ? 'active' : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.4rem'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Excel Import
          </button>
        )}
      </div>

      <div style={{ display: activeTab === 'single' ? 'block' : 'none' }}>
        <div className="single-check-view">
          <div className="sample-buttons">
            <button className="btn-secondary" onClick={() => loadSample('johnDoe', 1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Load John Doe (Day 1)
            </button>
            <button className="btn-secondary" onClick={() => loadSample('peterParker', 1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Load Peter Parker (Day 1)
            </button>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button onClick={handleCheck} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Check Note
              </>
            )}
          </button>

          {result && (
            <div className="results-container" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 10 }}>
                  <button className="btn-secondary" onClick={copyToClipboard}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy as TSV
                  </button>
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
      </div>

      <div style={{ display: activeTab === 'excel' ? 'block' : 'none' }}>
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
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="toast toast-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </AuthProvider>
  );
}
