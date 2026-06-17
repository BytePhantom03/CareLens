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
      
      <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
        <table style={{ margin: 0 }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ width: '15%' }}>Resident</th>
              <th style={{ width: '10%' }}>Day</th>
              <th style={{ width: '75%' }}>Progress Note Text</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map((inp, idx) => (
              <tr key={idx}>
                <td>{inp.residentName}</td>
                <td>Day {inp.dayNumber}</td>
                <td style={{ padding: '0.5rem' }}>
                  <textarea 
                    value={inp.progressNote} 
                    onChange={(e) => handleNoteChange(idx, e.target.value)}
                    style={{ width: '100%', minHeight: '80px', border: '1px solid transparent', borderRadius: '0.25rem', resize: 'vertical' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p className="subtitle" style={{ alignSelf: 'center' }}>{inputs.length} note{inputs.length !== 1 ? 's' : ''} ready to check.</p>
        <button onClick={() => onRunAll(inputs)}>Looks correct, Run Checks</button>
      </div>
    </div>
  );
}
