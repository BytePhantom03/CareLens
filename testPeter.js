import dotenv from 'dotenv';
dotenv.config();

global.import = { meta: { env: process.env } };

import { checkNote } from './src/services/checker.js';

const note = `Progress Note — Fall Incident
Resident: Peter Parker  |  Room: 3D
Date: 10 June 2025  |  Time of fall: 14:30

Resident found on floor in corridor near nurses station. Witnessed by AIN Tom Baxter. Complaining of right hip pain. Alert and orientated. No visible injury.

Immediate actions: Assisted back to wheelchair. Comfort measures applied.

GP (Dr Kevin Park) notified. Advised to monitor.
Family has been informed.

Risk factors: History of falls. On blood pressure medication.
Care plan: Will update.`;

async function run() {
  try {
    const res = await checkNote(note, 1);
    console.log(JSON.stringify(res, null, 2));
  } catch(err) {
    console.error(err);
  }
}

run();
