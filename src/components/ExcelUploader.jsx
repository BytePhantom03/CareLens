import React, { useState } from 'react';
import { parseFallsWorkbook } from '../services/excelParser';
import { toPipelineInputs } from '../utils/excelMapper';

export default function ExcelUploader({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrors([]);

    try {
      const { residents, parseErrors } = await parseFallsWorkbook(file);
      const pipelineInputs = toPipelineInputs(residents);
      
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
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
      // Reset input so the same file can be uploaded again if needed
      e.target.value = null;
    }
  };

  return (
    <div className="excel-uploader">
      <div className="form-group" style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem' }}>
        <h3>Upload Resident Progress Notes (.xlsx)</h3>
        <p className="subtitle">Upload the standard Excel export of resident notes</p>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ marginTop: '1rem' }}
        />
        {loading && <div style={{ marginTop: '1rem' }}><span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /> Parsing workbook...</div>}
      </div>

      {errors.length > 0 && (
        <div className="error-banner" style={{ marginTop: '1rem' }}>
          <h4>Parsing Warnings</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {errors.map((e, i) => (
              <li key={i}><strong>{e.sheet}:</strong> {e.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
