const STORAGE_KEY = 'falls_checker_audit_history';

/**
 * Audit history format:
 * [
 *   {
 *     id: "uuid",
 *     timestamp: 1678912345,
 *     residentName: "John Doe",
 *     dayNumber: 1,
 *     overall_status: "complete" | "has_issues" | "error",
 *     flags: [ ... ],
 *     source: "single" | "batch"
 *   }
 * ]
 */

export function getAuditHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse audit history', err);
    return [];
  }
}

export function saveAuditResults(results, source = 'batch') {
  try {
    const history = getAuditHistory();
    const newEntries = Array.isArray(results) ? results : [results];

    const enrichedEntries = newEntries.map(entry => ({
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      source
    }));

    const updatedHistory = [...enrichedEntries, ...history];
    const trimmedHistory = updatedHistory.slice(0, 1000);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (err) {
    console.error('Failed to save audit history', err);
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
