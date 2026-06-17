export const SAMPLE_RESIDENTS = {
  johnDoe: {
    name: "John Doe",
    expected: "complete",
    notes: {
      day1: `Progress Note — Fall Incident
Resident: John Doe  |  Room: 8B
Date: 10 June 2025  |  Time of fall: 07:15

Found sitting on floor next to bed. Witnessed by self. Pain rated 2/10 in left knee. Alert and orientated. No visible injury. Moving all limbs well.

Vital signs: BP 130/80, HR 78, RR 18, Temp 36.8, SpO2 98%.

Immediate actions: Assessed for injury before assisting up. Mobility aid (walker) was out of reach.

GP (Dr Sarah Jenkins) notified at 07:30. Advised to continue neuro obs and call if pain > 5/10.
NOK (daughter Jane) notified at 07:45. She will visit this afternoon.

Risk factors: History of arthritis, mobility aid not used.
Care plan: Reviewed and updated — Yes. Falls risk score reassessed.`,
      day2: `Progress Note
Resident: John Doe  |  Room: 8B
Date: 11 June 2025

Pain status updated: Left knee pain resolved (0/10). Mobility: Can full weight-bear without pain.

No new symptoms since Day 1 (no bruising, swelling, or confusion).

Vital signs: BP 128/78, HR 76, RR 18, Temp 36.7, SpO2 99%.

GP follow-up: Monitored per advice, pain did not exceed 5/10 so no further action needed.
Care plan changes: Reminded to keep walker within reach.`,
      day3: `Progress Note
Resident: John Doe  |  Room: 8B
Date: 12 June 2025

Pain outcome: Resolved.
Mobility: Confirmed returned to baseline (independent with walker).
Outstanding actions: None.

Formal incident closure: Post-fall monitoring period is complete.
Falls prevention plan reviewed with resident and daughter.`
    }
  },
  peterParker: {
    name: "Peter Parker",
    expected: "has_issues",
    notes: {
      day1: `Progress Note — Fall Incident
Resident: Peter Parker  |  Room: 3D
Date: 10 June 2025  |  Time of fall: 14:30

Resident found on floor in corridor near nurses station. Witnessed by AIN Tom Baxter. Complaining of right hip pain. Alert and orientated. No visible injury.

Immediate actions: Assisted back to wheelchair. Comfort measures applied.

GP (Dr Kevin Park) notified. Advised to monitor.
Family has been informed.

Risk factors: History of falls. On blood pressure medication.
Care plan: Will update.`,
      day2: `Progress Note
Resident: Peter Parker  |  Room: 3D
Date: 11 June 2025

Peter had a quiet night. Seems okay this morning. Ate breakfast.`,
      day3: `Progress Note
Resident: Peter Parker  |  Room: 3D
Date: 12 June 2025

Peter is doing much better. No further falls. Family visited.`
    }
  }
};
