import React from 'react';

const FLAG_ORDER = { Missing: 0, Incomplete: 1, Vague: 1, Complete: 2, Error: -1 };
const FLAG_ICON = { Missing: '🚩', Incomplete: '🔶', Vague: '⚠️', Complete: '✅', Error: '❌' };

export default function ResidentReportTable({ residentName, dayResults }) {
  // dayResults: [{ dayNumber, overall_status, flags: [{flag_type, field, explanation}] }, ...]
  const sortedDays = [...dayResults].sort((a, b) => a.dayNumber - b.dayNumber);

  const rows = sortedDays.flatMap(day => {
    // Handle error case from the pipeline
    if (day.status === 'error' || day.overall_status === 'error') {
      const flags = day.flags || [{ flag_type: 'Error', field: 'Check Failed', explanation: day.error || 'System error' }];
      return flags.map(flag => ({
        dayLabel: `Day ${day.dayNumber}`,
        flagType: flag.flag_type,
        field: flag.field,
        explanation: flag.explanation
      }));
    }

    // Default flags logic
    const flags = day.flags || (day.data && day.data.flags) || [];
    
    if (!flags || flags.length === 0) {
       // If no flags are present, generate a complete row
       return [{
         dayLabel: `Day ${day.dayNumber}`,
         flagType: 'Complete',
         field: 'All requirements met',
         explanation: 'No flags raised.'
       }];
    }

    const sortedFlags = [...flags].sort(
      (a, b) => (FLAG_ORDER[a.flag_type] ?? 9) - (FLAG_ORDER[b.flag_type] ?? 9)
    );
    
    return sortedFlags.map(flag => ({
      dayLabel: `Day ${day.dayNumber}`,
      flagType: flag.flag_type,
      field: flag.field,
      explanation: flag.explanation
    }));
  });

  return (
    <div className="resident-report">
      <div className="results-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <h3>Checker Output — {residentName}</h3>
      </div>
      <p className="report-subtitle" style={{ padding: '0 1.5rem 1rem 1.5rem', margin: 0, color: 'var(--text-light)' }}>
        All {sortedDays.length} day(s) reviewed against the Falls Management Policy.
      </p>
      <table className="report-table">
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Day</th>
            <th style={{ width: '15%' }}>Flag Type</th>
            <th style={{ width: '25%' }}>Field</th>
            <th style={{ width: '50%' }}>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`flag-row flag-row--${row.flagType.toLowerCase()}`}>
              <td style={{ fontWeight: 500 }}>{row.dayLabel}</td>
              <td>{FLAG_ICON[row.flagType] || ''} {row.flagType}</td>
              <td style={{ fontWeight: 500 }}>{row.field}</td>
              <td style={{ color: 'var(--text-light)' }}>{row.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
