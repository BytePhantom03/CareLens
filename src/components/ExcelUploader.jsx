import React, { useState } from 'react';
import { parseFallsWorkbook } from '../services/excelParser';
import { toPipelineInputs } from '../utils/excelMapper';

export default function ExcelUploader({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrors([]);

    try {
      const { residents, parseErrors } = await parseFallsWorkbook(file);
      const { inputs: pipelineInputs, warnings: validationWarnings } = toPipelineInputs(residents);
      
      const allErrors = [...parseErrors];
      if (validationWarnings.length > 0) {
        validationWarnings.forEach(w => {
          allErrors.push({ sheet: w.residentName, reason: w.message });
        });
      }

      if (allErrors.length > 0) {
        setErrors(allErrors);
      }
      
      if (pipelineInputs.length > 0) {
        onUploadSuccess(pipelineInputs);
      } else {
        setErrors(prev => [...prev, { sheet: 'All', reason: 'No valid resident notes found in workbook' }]);
      }
    } catch (err) {
      setErrors([{ sheet: 'File', reason: err.message || 'Failed to read Excel file' }]);
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="excel-uploader">
      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
      >
        <div className="upload-zone-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h3>Upload Resident Progress Notes</h3>
        <p className="subtitle">Drag &amp; drop your Excel export here, or click to browse</p>

        <div className="file-types">
          <span className="file-type-tag">.xlsx</span>
          <span className="file-type-tag">.xls</span>
          <span className="file-type-tag">.csv</span>
        </div>

        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          disabled={loading}
        />

        {loading && (
          <div className="processing-card">
            <div className="circular-spinner" />
            <div className="processing-info">
              <div className="processing-title">Parsing workbook…</div>
              <div className="processing-current">Reading sheets and extracting resident notes</div>
            </div>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="error-banner">
          <h4>Parsing Warnings</h4>
          <ul>
            {errors.map((e, i) => (
              <li key={i}><strong>{e.sheet}:</strong> {e.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

