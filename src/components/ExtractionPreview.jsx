import React, { useState } from 'react';

export default function ExtractionPreview({ initialInputs, onRunAll }) {
  const [inputs, setInputs] = useState(initialInputs);

  const handleNoteChange = (index, newValue) => {
    const newInputs = [...inputs];
    newInputs[index].progressNote = newValue;
    setInputs(newInputs);
  };

  return (
    <div className="extraction-preview">
      <h3>Extraction Preview</h3>
      <p className="subtitle">Review the extracted notes. You can manually edit the text if the OCR/parser missed something.</p>

      <div className="preview-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Day</th>
              <th>Progress Note Text</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map((inp, idx) => (
              <tr key={idx}>
                <td>{inp.residentName}</td>
                <td>Day {inp.dayNumber}</td>
                <td>
                  <textarea
                    value={inp.progressNote}
                    onChange={(e) => handleNoteChange(idx, e.target.value)}
                  />
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
          {inputs.length} note{inputs.length !== 1 ? 's' : ''} ready
        </span>
        <button onClick={() => onRunAll(inputs)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Run Checks
        </button>
      </div>
    </div>
  );
}
