import * as XLSX from 'xlsx';

const TITLE_REGEX = /Progress Notes\s*—\s*(.+?)\s*\|\s*Room:\s*(.+?)\s*\|\s*DOB:\s*(.+)/i;
const DAY_REGEX = /Day\s*(\d)/i;

export async function parseFallsWorkbook(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const residents = [];
  const parseErrors = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const titleRow = rows.find(r => /Progress Notes/i.test(r[0] || ''));
    const headerRowIndex = rows.findIndex(r => /^Day$/i.test((r[0] || '').toString().trim()));

    if (!titleRow || headerRowIndex === -1) {
      // Silently skip non-falls sheets like "Instructions"
      if (sheetName.toLowerCase().includes('instruction') || sheetName.toLowerCase().includes('cover')) continue;
      parseErrors.push({ sheet: sheetName, reason: 'Could not locate title or header row' });
      continue;
    }

    const titleMatch = TITLE_REGEX.exec(titleRow[0]);
    const residentName = titleMatch ? titleMatch[1].trim() : sheetName;
    const room = titleMatch ? titleMatch[2].trim() : null;
    const dob = titleMatch ? titleMatch[3].trim() : null;

    // Read day rows beneath header dynamically
    const dayRows = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        if (DAY_REGEX.test(rows[i][0] || '')) {
            dayRows.push(rows[i]);
        }
    }

    const days = dayRows.map(r => {
      const dayMatch = DAY_REGEX.exec(r[0] || '');
      // Handle numeric Excel date codes
      let dateValue = r[1];
      if (typeof dateValue === 'number') {
         const d = XLSX.SSF.parse_date_code(dateValue);
         dateValue = `${d.d}/${d.m}/${d.y}`;
      } else {
         dateValue = (dateValue || '').toString().trim();
      }

      return {
        dayNumber: dayMatch ? parseInt(dayMatch[1], 10) : null,
        date: dateValue,
        documentedBy: (r[2] || '').toString().trim(),
        progressNote: (r[3] || '').toString().trim()
      };
    }).filter(d => d.dayNumber && d.progressNote.length >= 10);

    if (days.length === 0) {
      parseErrors.push({ sheet: sheetName, reason: 'No valid day rows extracted' });
      continue;
    }

    residents.push({ residentName, room, dob, sourceSheet: sheetName, days });
  }

  return { residents, parseErrors };
}
