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
      if (err.message.includes('rate limit') || err.message.includes('RATE_LIMIT') || err.message.includes('429')) {
        console.warn('Rate limit hit. Pausing batch queue for 10 seconds before retrying...');
        await new Promise(r => setTimeout(r, 10000));
        i--;
        continue;
      }

      results.push({
        residentName: input.residentName,
        dayNumber: input.dayNumber,
        overall_status: 'error',
        flags: [{ flag_type: 'Error', field: 'Check Failed', explanation: err.message }]
      });
    }

    if (i < pipelineInputs.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return results;
}
