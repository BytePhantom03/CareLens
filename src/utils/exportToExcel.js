import * as XLSX from 'xlsx';
import { groupResultsByResident } from './groupResultsByResident';

export function exportBatchToExcel(batchResults) {
  const grouped = groupResultsByResident(batchResults);
  const workbook = XLSX.utils.book_new();

  for (const [residentName, dayResults] of Object.entries(grouped)) {
    const numDays = dayResults.length;
    const dayText = numDays === 1 ? 'day' : 'days';

    const sheetRows = [
      [`Checker Output — ${residentName}`, '', '', ''],
      [`All ${numDays} ${dayText} reviewed against the Falls Management Policy.`, '', '', ''],
      ['Day', 'Flag Type', 'Field', 'Explanation']
    ];
    
    const sortedDays = [...dayResults].sort((a, b) => a.dayNumber - b.dayNumber);
    
    sortedDays.forEach(day => {
      if (day.status === 'error' || day.overall_status === 'error') {
        const flags = day.flags || [{ flag_type: 'Error', field: 'Check Failed', explanation: day.error || 'System error' }];
        flags.forEach(flag => {
           sheetRows.push([`Day ${day.dayNumber}`, flag.flag_type, flag.field, flag.explanation]);
        });
        return;
      }
      
      const flags = day.flags || (day.data && day.data.flags) || [];
      if (!flags || flags.length === 0) {
         sheetRows.push([`Day ${day.dayNumber}`, 'Complete', 'All requirements met', 'No flags raised.']);
         return;
      }
      
      const FLAG_ORDER = { Missing: 0, Incomplete: 1, Vague: 1, Complete: 2, Error: -1 };
      const sortedFlags = [...flags].sort(
        (a, b) => (FLAG_ORDER[a.flag_type] ?? 9) - (FLAG_ORDER[b.flag_type] ?? 9)
      );

      sortedFlags.forEach(flag => {
        let icon = "✅";
        if (flag.flag_type === "Missing") icon = "🚩";
        if (flag.flag_type === "Vague") icon = "⚠️";
        if (flag.flag_type === "Incomplete") icon = "🔶";
        
        sheetRows.push([`Day ${day.dayNumber}`, `${icon} ${flag.flag_type}`, flag.field, flag.explanation]);
      });
    });
    
    const sheet = XLSX.utils.aoa_to_sheet(sheetRows);

    sheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
    ];
    
    sheet['!cols'] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 35 },
      { wch: 80 }
    ];

    XLSX.utils.book_append_sheet(workbook, sheet, residentName.substring(0, 31)); 
  }

  XLSX.writeFile(workbook, `Checker_Output_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
