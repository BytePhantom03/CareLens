export function groupResultsByResident(batchResults) {
  const grouped = {};
  for (const result of batchResults) {
    // Fallback if residentName isn't defined
    const name = result.residentName || 'Unknown Resident';
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(result);
  }
  return grouped;
}
