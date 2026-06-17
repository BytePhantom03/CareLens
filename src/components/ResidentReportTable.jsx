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

  const getBadgeClass = (flagType) => {
    switch (flagType) {
      case 'Missing': return 'flag-badge flag-missing';
      case 'Vague': return 'flag-badge flag-vague';
      case 'Incomplete': return 'flag-badge flag-vague';
      case 'Complete': return 'flag-badge flag-complete';
      default: return '';
    }
  };

  return (
    <div className="resident-report">
      <div className="results-header">
        <h3>Checker Output — {residentName}</h3>
      </div>
      <p className="report-subtitle">
        All {sortedDays.length} day(s) reviewed against the Falls Management Policy.
      </p>
      <table className="report-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Flag Type</th>
            <th>Field</th>
            <th>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`flag-row flag-row--${row.flagType.toLowerCase()}`}>
              <td style={{ fontWeight: 500 }}>{row.dayLabel}</td>
              <td>
                {getBadgeClass(row.flagType) ? (
                  <span className={getBadgeClass(row.flagType)}>
                    {FLAG_ICON[row.flagType]} {row.flagType}
                  </span>
                ) : (
                  <>{FLAG_ICON[row.flagType] || ''} {row.flagType}</>
                )}
              </td>
              <td style={{ fontWeight: 500 }}>{row.field}</td>
              <td>{row.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
