import React, { useState } from 'react';

export default function ExtractionPreview({ initialInputs, onRunAll }) {
  const [inputs, setInputs] = useState(initialInputs);

  const handleNoteChange = (index, newValue) => {
    const newInputs = [...inputs];
    newInputs[index].progressNote = newValue;
    setInputs(newInputs);
  };

  const blockedCount = inputs.filter(i => i.blocked).length;
  const validCount = inputs.length - blockedCount;

  return (
    <div className="extraction-preview">
      <h3>Extraction Preview</h3>
      <p className="subtitle">Review the extracted notes. You can manually edit the text if the OCR/parser missed something.</p>

      {blockedCount > 0 && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>{blockedCount} note{blockedCount !== 1 ? 's' : ''} blocked</strong> due to missing prerequisites or insufficient time gaps. These will be skipped during processing.
          </span>
        </div>
      )}

      <div className="preview-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Day</th>
              <th>Status</th>
              <th>Progress Note Text</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map((inp, idx) => (
              <tr key={idx} className={inp.blocked ? 'row-blocked' : ''}>
                <td>{inp.residentName}</td>
                <td>Day {inp.dayNumber}</td>
                <td>
                  {inp.blocked ? (
                    <span className="status-blocked" title={inp.blockReason}>
                      ⚠️ Blocked
                    </span>
                  ) : (
                    <span className="status-ready">✅ Ready</span>
                  )}
                </td>
                <td>
                  {inp.blocked ? (
                    <div className="blocked-reason">{inp.blockReason}</div>
                  ) : (
                    <textarea
                      value={inp.progressNote}
                      onChange={(e) => handleNoteChange(idx, e.target.value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="preview-footer">
        <span className="note-count">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {validCount} note{validCount !== 1 ? 's' : ''} ready
          {blockedCount > 0 && ` · ${blockedCount} blocked`}
        </span>
        <button onClick={() => onRunAll(inputs.filter(i => !i.blocked))} disabled={validCount === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Run Checks ({validCount})
        </button>
      </div>
    </div>
  );
}
