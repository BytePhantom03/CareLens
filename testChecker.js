import { checkNote } from './src/services/checker.js';
import { SAMPLE_RESIDENTS } from './src/data/samples.js';

// Setup basic polyfills/mocks for testing outside Vite
import dotenv from 'dotenv';
dotenv.config();

// Vite polyfill
globalThis.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

async function runTest() {
  try {
    console.log('Testing Peter Parker Day 1...');
    const peterD1 = SAMPLE_RESIDENTS.peterParker.notes.day1;
    const result1 = await checkNote(peterD1, 1);
    console.log(JSON.stringify(result1, null, 2));

    console.log('\\nTesting John Doe Day 1...');
    const johnD1 = SAMPLE_RESIDENTS.johnDoe.notes.day1;
    const result2 = await checkNote(johnD1, 1);
    console.log(JSON.stringify(result2, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

runTest();
