import React, { useState, useEffect } from 'react';
import './ApiSettingsModal.css';

export default function ApiSettingsModal({ onClose }) {
  const [keys, setKeys] = useState({
    VITE_GITHUB_TOKEN: '',
    VITE_GROQ_API_KEY: '',
    VITE_GEMINI_API_KEY: '',
    VITE_GEMINI_API_KEY_2: ''
  });
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing keys from localStorage
    setKeys({
      VITE_GITHUB_TOKEN: localStorage.getItem('VITE_GITHUB_TOKEN') || '',
      VITE_GROQ_API_KEY: localStorage.getItem('VITE_GROQ_API_KEY') || '',
      VITE_GEMINI_API_KEY: localStorage.getItem('VITE_GEMINI_API_KEY') || '',
      VITE_GEMINI_API_KEY_2: localStorage.getItem('VITE_GEMINI_API_KEY_2') || ''
    });
  }, []);

  const handleChange = (e) => {
    setKeys(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    Object.entries(keys).forEach(([key, value]) => {
      if (value.trim() === '') {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value.trim());
      }
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="api-settings-overlay" onClick={onClose}>
      <div className="api-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="api-settings-header">
          <h2>API Configuration</h2>
          <button className="api-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="api-settings-body">
          <p className="api-settings-desc">
            These keys are stored securely in your browser's local storage and will override the default environment variables. This is useful for deployment or testing.
          </p>

          <div className="api-form-group">
            <label>GitHub Personal Access Token (Models API)</label>
            <input 
              type="password" 
              name="VITE_GITHUB_TOKEN"
              value={keys.VITE_GITHUB_TOKEN}
              onChange={handleChange}
              placeholder="github_pat_..."
            />
          </div>

          <div className="api-form-group">
            <label>Groq API Key</label>
            <input 
              type="password" 
              name="VITE_GROQ_API_KEY"
              value={keys.VITE_GROQ_API_KEY}
              onChange={handleChange}
              placeholder="gsk_..."
            />
          </div>

          <div className="api-form-group">
            <label>Gemini API Key (Primary)</label>
            <input 
              type="password" 
              name="VITE_GEMINI_API_KEY"
              value={keys.VITE_GEMINI_API_KEY}
              onChange={handleChange}
              placeholder="AIza..."
            />
          </div>

          <div className="api-form-group">
            <label>Gemini API Key (Fallback)</label>
            <input 
              type="password" 
              name="VITE_GEMINI_API_KEY_2"
              value={keys.VITE_GEMINI_API_KEY_2}
              onChange={handleChange}
              placeholder="AIza..."
            />
          </div>
        </div>

        <div className="api-settings-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="api-save-btn" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
