import XLSX from 'xlsx-js-style';
import { groupResultsByResident } from './groupResultsByResident';

/* ============================================================
   Cell Style Presets
   ============================================================ */
const HEADER_BG = '2F3A56';          // Dark navy-blue
const HEADER_FONT = 'FFFFFF';        // White text
const MISSING_BG = 'F2DCDB';         // Light salmon/pink
const VAGUE_BG = 'FFF8E1';           // Light warm yellow
const COMPLETE_BG = 'E8F5E9';        // Light green
const ERROR_BG = 'FFCDD2';           // Red tint
const TITLE_BG = '1B2A4A';           // Very dark navy for title
const TITLE_FONT = 'FFFFFF';
const SUBTITLE_BG = 'F5F5F5';        // Light grey for subtitle
const INPUT_NOTE_BG = 'FFFFFF';       // White for notes
const BORDER_COLOR = 'BFBFBF';

const thin = { style: 'thin', color: { rgb: BORDER_COLOR } };
const allBorders = { top: thin, bottom: thin, left: thin, right: thin };

function makeStyle(fill, fontColor = '333333', bold = false, fontSize = 11, wrapText = true) {
  const s = {
    font: { name: 'Calibri', sz: fontSize, color: { rgb: fontColor }, bold },
    alignment: { vertical: 'top', wrapText, horizontal: 'left' },
    border: allBorders,
  };
  if (fill) s.fill = { fgColor: { rgb: fill }, patternType: 'solid' };
  return s;
}

const titleStyle = makeStyle(TITLE_BG, TITLE_FONT, true, 14, false);
const subtitleStyle = makeStyle(SUBTITLE_BG, '666666', false, 10, false);
const headerStyle = makeStyle(HEADER_BG, HEADER_FONT, true, 11, false);
const missingStyle = makeStyle(MISSING_BG);
const vagueStyle = makeStyle(VAGUE_BG);
const completeStyle = makeStyle(COMPLETE_BG);
const errorStyle = makeStyle(ERROR_BG);
const normalStyle = makeStyle(null);
const inputNoteStyle = makeStyle(INPUT_NOTE_BG, '333333', false, 11, true);
const inputHeaderStyle = makeStyle(HEADER_BG, HEADER_FONT, true, 11, false);

/* ============================================================
   Row-style helper based on flag type
   ============================================================ */
function getRowStyle(flagType) {
  switch (flagType) {
    case 'Missing': return missingStyle;
    case 'Vague':
    case 'Incomplete': return vagueStyle;
    case 'Complete': return completeStyle;
    case 'Error': return errorStyle;
    default: return normalStyle;
  }
}

/* ============================================================
   Create a styled cell
   ============================================================ */
function cell(value, style) {
  return { v: value, t: 's', s: style };
}

/* ============================================================
   Build an Input sheet for one resident
   ============================================================ */
function buildInputSheet(residentName, pipelineInputs) {
  // Get this resident's inputs sorted by day
  const residentInputs = pipelineInputs
    .filter(inp => inp.residentName === residentName)
    .sort((a, b) => a.dayNumber - b.dayNumber);

  const rows = [];

  // Row 0: Title
  rows.push([
    cell(`Progress Notes — ${residentName}`, titleStyle),
    cell('', titleStyle),
    cell('', titleStyle),
    cell('', titleStyle)
  ]);

  // Row 1: Subtitle
  const numDays = residentInputs.length;
  rows.push([
    cell(`${numDays} consecutive daily progress note${numDays !== 1 ? 's' : ''} uploaded for compliance checking.`, subtitleStyle),
    cell('', subtitleStyle),
    cell('', subtitleStyle),
    cell('', subtitleStyle)
  ]);

  // Row 2: Headers
  rows.push([
    cell('Day', inputHeaderStyle),
    cell('Date', inputHeaderStyle),
    cell('Source', inputHeaderStyle),
    cell('Progress Note', inputHeaderStyle)
  ]);

  // Data rows
  residentInputs.forEach(inp => {
    const noteStyle = makeStyle(INPUT_NOTE_BG, '333333', false, 11, true);
    rows.push([
      cell(`Day ${inp.dayNumber}`, makeStyle('F9F9F9', '333333', true, 11, false)),
      cell(inp.checkDate || '', makeStyle('F9F9F9', '666666', false, 11, false)),
      cell('Uploaded', makeStyle('F9F9F9', '666666', false, 10, false)),
      cell(inp.progressNote || '', noteStyle)
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Merge title and subtitle rows across all columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
  ];

  // Column widths
  ws['!cols'] = [
    { wch: 10 },   // Day
    { wch: 16 },   // Date
    { wch: 14 },   // Source
    { wch: 90 }    // Progress Note
  ];

  // Row heights for note rows (taller to show wrapped text)
  ws['!rows'] = [
    { hpt: 28 },   // Title
    { hpt: 20 },   // Subtitle
    { hpt: 22 },   // Headers
  ];
  residentInputs.forEach((_, i) => {
    ws['!rows'][3 + i] = { hpt: 80 };
  });

  return ws;
}

/* ============================================================
   Build an Output sheet for one resident
   ============================================================ */
function buildOutputSheet(residentName, dayResults) {
  const numDays = dayResults.length;
  const dayText = numDays === 1 ? 'day' : 'days';

  const rows = [];

  // Row 0: Title
  rows.push([
    cell(`Checker Output — ${residentName}`, titleStyle),
    cell('', titleStyle),
    cell('', titleStyle),
    cell('', titleStyle)
  ]);

  // Row 1: Subtitle
  rows.push([
    cell(`All ${numDays} ${dayText} reviewed against the Falls Management Policy.`, subtitleStyle),
    cell('', subtitleStyle),
    cell('', subtitleStyle),
    cell('', subtitleStyle)
  ]);

  // Row 2: Headers
  rows.push([
    cell('Day', headerStyle),
    cell('Flag Type', headerStyle),
    cell('Field', headerStyle),
    cell('Explanation', headerStyle)
  ]);

  // Data rows
  const sortedDays = [...dayResults].sort((a, b) => a.dayNumber - b.dayNumber);
  const FLAG_ORDER = { Missing: 0, Incomplete: 1, Vague: 1, Complete: 2, Error: -1 };

  sortedDays.forEach(day => {
    if (day.status === 'error' || day.overall_status === 'error') {
      const flags = day.flags || [{ flag_type: 'Error', field: 'Check Failed', explanation: day.error || 'System error' }];
      flags.forEach(flag => {
        const style = errorStyle;
        rows.push([
          cell(`Day ${day.dayNumber}`, style),
          cell(`❌ ${flag.flag_type}`, style),
          cell(flag.field, style),
          cell(flag.explanation, style)
        ]);
      });
      return;
    }

    const flags = day.flags || (day.data && day.data.flags) || [];
    if (!flags || flags.length === 0) {
      rows.push([
        cell(`Day ${day.dayNumber}`, completeStyle),
        cell('✅ Complete', completeStyle),
        cell('All requirements met', completeStyle),
        cell('No flags raised.', completeStyle)
      ]);
      return;
    }

    const sortedFlags = [...flags].sort(
      (a, b) => (FLAG_ORDER[a.flag_type] ?? 9) - (FLAG_ORDER[b.flag_type] ?? 9)
    );

    sortedFlags.forEach(flag => {
      let icon = '✅';
      if (flag.flag_type === 'Missing') icon = '🚩';
      if (flag.flag_type === 'Vague') icon = '⚠️';
      if (flag.flag_type === 'Incomplete') icon = '🔶';

      const style = getRowStyle(flag.flag_type);
      rows.push([
        cell(`Day ${day.dayNumber}`, style),
        cell(`${icon} ${flag.flag_type}`, style),
        cell(flag.field, style),
        cell(flag.explanation, style)
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Merge title and subtitle rows
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
  ];

  // Column widths
  ws['!cols'] = [
    { wch: 10 },   // Day
    { wch: 15 },   // Flag Type
    { wch: 35 },   // Field
    { wch: 90 }    // Explanation
  ];

  // Row heights
  ws['!rows'] = [
    { hpt: 28 },   // Title
    { hpt: 20 },   // Subtitle
    { hpt: 22 },   // Headers
  ];

  return ws;
}

/* ============================================================
   Main Export Function
   ============================================================ */
export function exportBatchToExcel(batchResults, pipelineInputs = []) {
  const grouped = groupResultsByResident(batchResults);
  const workbook = XLSX.utils.book_new();

  for (const [residentName, dayResults] of Object.entries(grouped)) {
    // Truncate sheet name to 31 chars (Excel limit)
    const safeName = residentName.substring(0, 22);

    // 1. Create Input sheet (original progress notes)
    if (pipelineInputs.length > 0) {
      const inputSheet = buildInputSheet(residentName, pipelineInputs);
      XLSX.utils.book_append_sheet(workbook, inputSheet, `${safeName} - Input`);
    }

    // 2. Create Output sheet (checker results)
    const outputSheet = buildOutputSheet(residentName, dayResults);
    XLSX.utils.book_append_sheet(workbook, outputSheet, `${safeName} - Output`);
  }

  XLSX.writeFile(workbook, `CareLens_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
