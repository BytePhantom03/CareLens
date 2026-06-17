export function groupResultsByResident(batchResults) {
  const grouped = {};
  for (const [index, result] of batchResults.entries()) {
    const name = result.residentName || `Unknown Resident ${index + 1}`;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(result);
  }
  return grouped;
}
