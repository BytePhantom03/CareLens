import { runBatchChecks } from './src/services/batchRunner.js';
import assert from 'assert';

async function main() {
  console.log('Running batchRunner test...');
  
  const mockInputs = [
    { residentName: 'John', dayNumber: 1, progressNote: 'A' },
    { residentName: 'John', dayNumber: 2, progressNote: 'B' },
    { residentName: 'John', dayNumber: 3, progressNote: 'C' },
    { residentName: 'Peter', dayNumber: 1, progressNote: 'D' },
    { residentName: 'Peter', dayNumber: 2, progressNote: 'E' },
    { residentName: 'Peter', dayNumber: 3, progressNote: 'F' },
  ];
  
  // Mock checkNote function
  const mockCheckNote = async (note, day) => {
    return {
      overall_status: 'complete',
      flags: [{ flag_type: 'Complete', field: 'Test', explanation: `Tested note ${note}` }]
    };
  };

  const results = await runBatchChecks(mockInputs, null, null, mockCheckNote);
  
  // Assertion 1: Length must be exactly 6
  assert.strictEqual(results.length, 6, `Expected length 6, got ${results.length}`);
  
  // Assertion 2: Output array contains all 6 unique markers in order
  const explanations = results.map(r => r.flags[0].explanation);
  const expectedExplanations = [
    'Tested note A', 'Tested note B', 'Tested note C', 
    'Tested note D', 'Tested note E', 'Tested note F'
  ];
  assert.deepStrictEqual(explanations, expectedExplanations, 'Output markers do not match expected order');
  
  console.log('All tests passed! 6 out of 6 items returned in order.');
}

main().catch(console.error);
