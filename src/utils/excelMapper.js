export function toPipelineInputs(residents, checkDate = new Date().toISOString().slice(0, 10)) {
  const inputs = [];
  for (const r of residents) {
    for (const d of r.days) {
      inputs.push({
        residentName: r.residentName,
        dayNumber: d.dayNumber,
        progressNote: d.progressNote,
        checkDate: d.date || checkDate
      });
    }
  }
  return inputs;
}
