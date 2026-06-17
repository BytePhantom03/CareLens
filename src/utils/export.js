export function exportToTSV(flags, day) {
  const header = "Day\tFlag Type\tField\tExplanation";
  const rows = flags.map(f => {
    let icon = "✅";
    if (f.flag_type === "Missing") icon = "🚩";
    if (f.flag_type === "Vague") icon = "⚠️";
    return `${day}\t${icon} ${f.flag_type}\t${f.field}\t${f.explanation}`;
  });
  return [header, ...rows].join('\n');
}
