import React, { useState, useMemo, useCallback } from 'react';

/**
 * Re-evaluates blocked status for all inputs based on current data.
 * Rules match excelMapper.js logic:
 * - Day 1: never blocked
 * - Day 2: blocked if Day 1 is missing or has < 10 chars
 * - Day 3: blocked if Day 1 or Day 2 is missing or has < 10 chars
 */
function revalidateInputs(inputs) {
  const updated = inputs.map(inp => ({ ...inp }));

  // Group by resident
  const grouped = {};
  for (const inp of updated) {
    if (!grouped[inp.residentName]) grouped[inp.residentName] = {};
    grouped[inp.residentName][inp.dayNumber] = inp;
  }

  for (const [, days] of Object.entries(grouped)) {
    if (days[1]) {
      days[1].blocked = false;
      days[1].blockReason = null;
    }

    if (days[2]) {
      const day1Valid = days[1] && days[1].progressNote && days[1].progressNote.trim().length >= 10;
      if (!day1Valid) {
        days[2].blocked = true;
        days[2].blockReason = 'Day 1 is missing. Day 2 requires Day 1 to be present.';
      } else {
        days[2].blocked = false;
        days[2].blockReason = null;
      }
    }

    if (days[3]) {
      const missing = [];
      const day1Valid = days[1] && days[1].progressNote && days[1].progressNote.trim().length >= 10;
      const day2Valid = days[2] && days[2].progressNote && days[2].progressNote.trim().length >= 10;
      if (!day1Valid) missing.push('Day 1');
      if (!day2Valid) missing.push('Day 2');

      if (missing.length > 0) {
        days[3].blocked = true;
        days[3].blockReason = `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} missing. Day 3 requires all preceding days.`;
      } else {
        days[3].blocked = false;
        days[3].blockReason = null;
      }
    }
  }

  return updated;
}

/**
 * Groups inputs by resident name, preserving order.
 * Returns: [{ residentName, days: { 1?: input, 2?: input, 3?: input } }, ...]
 */
function groupByResident(inputs) {
  const order = [];
  const map = {};

  for (const inp of inputs) {
    if (!map[inp.residentName]) {
      map[inp.residentName] = {};
      order.push(inp.residentName);
    }
    map[inp.residentName][inp.dayNumber] = inp;
  }

  return order.map(name => ({ residentName: name, days: map[name] }));
}

/**
 * For a resident, determine which days are missing and NEED to be added.
 * A day needs adding only if a LATER day exists (causing a block).
 * Returns: array of { dayNumber, position } where position is 'above' | 'between' | 'below'
 */
function getMissingDaySlots(days) {
  const existing = Object.keys(days).map(Number).sort();
  const maxDay = Math.max(...existing);
  const slots = [];

  for (let d = 1; d < maxDay; d++) {
    if (!days[d]) {
      slots.push(d);
    }
  }

  return slots;
}

export default function ExtractionPreview({ initialInputs, onRunAll }) {
  const [inputs, setInputs] = useState(() => {
    const sorted = [...initialInputs].sort((a, b) => {
      if (a.residentName !== b.residentName) return a.residentName.localeCompare(b.residentName);
      return a.dayNumber - b.dayNumber;
    });
    return sorted;
  });

  const handleNoteChange = useCallback((residentName, dayNumber, newValue) => {
    setInputs(prev => {
      const newInputs = prev.map(inp =>
        inp.residentName === residentName && inp.dayNumber === dayNumber
          ? { ...inp, progressNote: newValue }
          : inp
      );
      return revalidateInputs(newInputs);
    });
  }, []);

  const handleAddDay = useCallback((residentName, dayNumber) => {
    setInputs(prev => {
      const newInput = {
        residentName,
        dayNumber,
        progressNote: '',
        checkDate: new Date().toISOString().slice(0, 10),
        blocked: false,
        blockReason: null,
        isNew: true,
      };

      // Insert in correct position: find the right spot for this resident + day
      const newInputs = [...prev];
      let insertIdx = newInputs.length; // default: end

      for (let i = 0; i < newInputs.length; i++) {
        const inp = newInputs[i];
        if (inp.residentName === residentName && inp.dayNumber > dayNumber) {
          // Insert before the first day that's after this one
          insertIdx = i;
          break;
        }
        if (inp.residentName === residentName) {
          // After the last day of the same resident that's before this one
          insertIdx = i + 1;
        }
      }

      newInputs.splice(insertIdx, 0, newInput);
      return revalidateInputs(newInputs);
    });
  }, []);

  const handleRemoveDay = useCallback((residentName, dayNumber) => {
    setInputs(prev => {
      const newInputs = prev.filter(
        inp => !(inp.residentName === residentName && inp.dayNumber === dayNumber)
      );
      return revalidateInputs(newInputs);
    });
  }, []);

  const residents = useMemo(() => groupByResident(inputs), [inputs]);
  const blockedCount = useMemo(() => inputs.filter(i => i.blocked).length, [inputs]);
  const validCount = useMemo(() => inputs.filter(i => !i.blocked).length, [inputs]);
  const blockedItems = useMemo(() => inputs.filter(i => i.blocked), [inputs]);

  return (
    <div className="extraction-preview">
      <h3>Extraction Preview</h3>
      <p className="subtitle">Review the extracted notes. You can edit text or add missing days to unblock entries.</p>

      {blockedCount > 0 && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <strong>{blockedCount} note{blockedCount !== 1 ? 's' : ''} blocked</strong> — click the <span className="add-hint-badge">+</span> button to add missing days.
            <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0, listStyle: 'disc' }}>
              {blockedItems.map((inp, idx) => (
                <li key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <strong>{inp.residentName} — Day {inp.dayNumber}:</strong> {inp.blockReason}
                </li>
              ))}
            </ul>
          </div>
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
            {residents.map(({ residentName, days }) => {
              const missingSlots = getMissingDaySlots(days);
              const existingDays = Object.keys(days).map(Number).sort();

              // Build the full render list: existing days + add-hint rows in correct order
              const renderSlots = [];

              for (let d = 1; d <= 3; d++) {
                if (days[d]) {
                  // Existing day row
                  renderSlots.push({ type: 'data', dayNumber: d, input: days[d] });
                } else if (missingSlots.includes(d)) {
                  // Missing day that needs to be added (a later day exists)
                  renderSlots.push({ type: 'add-hint', dayNumber: d });
                }
                // If day doesn't exist and isn't needed → skip (no row)
              }

              return (
                <React.Fragment key={residentName}>
                  {renderSlots.map((slot, slotIdx) => {
                    if (slot.type === 'add-hint') {
                      return (
                        <tr key={`${residentName}-add-${slot.dayNumber}`} className="add-row-slot">
                          <td>{slotIdx === 0 ? residentName : ''}</td>
                          <td colSpan={3}>
                            <button
                              className="add-day-btn"
                              onClick={() => handleAddDay(residentName, slot.dayNumber)}
                              title={`Add Day ${slot.dayNumber} for ${residentName}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Add Day {slot.dayNumber} — {residentName}
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    const inp = slot.input;
                    return (
                      <tr
                        key={`${residentName}-day-${slot.dayNumber}`}
                        className={`${inp.blocked ? 'row-blocked' : ''} ${inp.isNew ? 'row-new' : ''}`}
                      >
                        <td>{residentName}</td>
                        <td>Day {inp.dayNumber}</td>
                        <td>
                          {inp.blocked ? (
                            <span className="status-blocked" title={inp.blockReason}>⚠️ Blocked</span>
                          ) : (
                            <span className="status-ready">✅ Ready</span>
                          )}
                        </td>
                        <td>
                          {inp.blocked && !inp.isNew ? (
                            <div className="blocked-reason">{inp.blockReason}</div>
                          ) : (
                            <div className="note-cell">
                              <textarea
                                value={inp.progressNote}
                                onChange={(e) => handleNoteChange(residentName, inp.dayNumber, e.target.value)}
                                placeholder={inp.isNew ? `Enter Day ${inp.dayNumber} progress note for ${residentName}…` : ''}
                                className={inp.isNew && inp.progressNote.trim().length < 10 ? 'textarea-needs-input' : ''}
                              />
                              {inp.isNew && (
                                <div className="new-row-controls">
                                  {inp.progressNote.trim().length < 10 && (
                                    <span className="char-hint">
                                      {inp.progressNote.trim().length}/10 chars minimum
                                    </span>
                                  )}
                                  {inp.progressNote.trim().length >= 10 && (
                                    <span className="char-hint" style={{ color: 'var(--success)' }}>
                                      ✓ Ready
                                    </span>
                                  )}
                                  <button
                                    className="remove-row-btn"
                                    onClick={() => handleRemoveDay(residentName, inp.dayNumber)}
                                    title="Remove this row"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
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
