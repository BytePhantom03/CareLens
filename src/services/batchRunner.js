import { checkNote } from './checker.js';

export async function runBatchChecks(pipelineInputs, onProgress, isCancelledRef, checkFn = checkNote) {
  const results = [];
  for (let i = 0; i < pipelineInputs.length; i++) {
    if (isCancelledRef && isCancelledRef.current) break;
    
    const input = pipelineInputs[i];
    onProgress?.(i + 1, pipelineInputs.length, input);

    try {
      const checked = await checkFn(input.progressNote, input.dayNumber);
      results.push({
        residentName: input.residentName,
        dayNumber: input.dayNumber,
        ...checked
      });
    } catch (err) {
      results.push({
        residentName: input.residentName,
        dayNumber: input.dayNumber,
        overall_status: 'error',
        flags: [{ flag_type: 'Error', field: 'Check Failed', explanation: err.message }]
      });
    }

    if (i < pipelineInputs.length - 1) {
      await new Promise(r => setTimeout(r, 500)); // respect rate limit
    }
  }
  return results;
}
