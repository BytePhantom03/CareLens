export function toPipelineInputs(residents, checkDate = new Date().toISOString().slice(0, 10)) {
  const inputs = [];
  const warnings = [];

  for (const r of residents) {
    const dayMap = {};
    const dateMap = {};

    for (const d of r.days) {
      if (d.dayNumber >= 1 && d.dayNumber <= 3) {
        dayMap[d.dayNumber] = d;
        if (d.date) {
          const parsed = parseFlexibleDate(d.date);
          if (parsed) dateMap[d.dayNumber] = parsed;
        }
      }
    }

    if (dayMap[1]) {
      inputs.push({
        residentName: r.residentName,
        dayNumber: 1,
        progressNote: dayMap[1].progressNote,
        checkDate: dayMap[1].date || checkDate,
        blocked: false,
        blockReason: null
      });
    }

    if (dayMap[2]) {
      let blocked = false;
      let blockReason = null;

      if (!dayMap[1]) {
        blocked = true;
        blockReason = 'Day 1 is missing. Day 2 requires Day 1 to be present.';
      } else if (dateMap[1] && dateMap[2] && (dateMap[2] - dateMap[1]) < 24 * 60 * 60 * 1000) {
        const diffHours = Math.round((dateMap[2] - dateMap[1]) / (1000 * 60 * 60));
        blocked = true;
        blockReason = `Day 2 is only ${diffHours}h after Day 1. Minimum 24-hour gap required.`;
      }

      if (blocked) {
        warnings.push({ residentName: r.residentName, type: 'blocked', dayNumber: 2, message: blockReason });
      }

      inputs.push({
        residentName: r.residentName,
        dayNumber: 2,
        progressNote: dayMap[2].progressNote,
        checkDate: dayMap[2].date || checkDate,
        blocked,
        blockReason
      });
    }

    if (dayMap[3]) {
      let blocked = false;
      let blockReason = null;

      if (!dayMap[1] || !dayMap[2]) {
        const missing = [];
        if (!dayMap[1]) missing.push('Day 1');
        if (!dayMap[2]) missing.push('Day 2');
        blocked = true;
        blockReason = `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} missing. Day 3 requires all preceding days.`;
      } else if (dateMap[2] && dateMap[3] && (dateMap[3] - dateMap[2]) < 24 * 60 * 60 * 1000) {
        const diffHours = Math.round((dateMap[3] - dateMap[2]) / (1000 * 60 * 60));
        blocked = true;
        blockReason = `Day 3 is only ${diffHours}h after Day 2. Minimum 24-hour gap required.`;
      }

      if (blocked) {
        warnings.push({ residentName: r.residentName, type: 'blocked', dayNumber: 3, message: blockReason });
      }

      inputs.push({
        residentName: r.residentName,
        dayNumber: 3,
        progressNote: dayMap[3].progressNote,
        checkDate: dayMap[3].date || checkDate,
        blocked,
        blockReason
      });
    }
  }

  return { inputs, warnings };
}

function parseFlexibleDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const cleaned = dateStr.trim();

  const ddmmyyyy = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (ddmmyyyy) {
    let [, d, m, y] = ddmmyyyy;
    if (y.length === 2) y = '20' + y;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(date.getTime())) return date;
  }

  const iso = Date.parse(cleaned);
  if (!isNaN(iso)) return new Date(iso);

  return null;
}
