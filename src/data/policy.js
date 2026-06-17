/**
 * Falls Management Policy — POL-FAL-001
 *
 * This file encodes the exact requirements from the written policy document.
 * Each requirement maps to a policy bullet point.
 * The extractionSchema tells the AI what to look for.
 * The evaluate function is a deterministic rule engine — it ONLY uses the AI's extracted booleans.
 *
 * DO NOT add requirements that are not in the original policy.
 * DO NOT modify evaluate functions — they are deterministic.
 */
export const FALLS_POLICY = {
  metadata: {
    policyNumber: "POL-FAL-001",
    version: "1.0",
    effectiveDate: "2025-06-01"
  },
  day1: {
    label: "Day 1 — Incident Report",
    requirements: [
      // Policy: "Date and time of fall"
      {
        id: "d1_datetime",
        field: "Date and time of fall",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the fall mentioned in the note?" },
          has_date: { type: "boolean", description: "Is the exact date of the fall stated (e.g. '10 June 2025')?" },
          has_time: { type: "boolean", description: "Is the exact time of the fall stated (e.g. '14:30')?" }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.has_date || !data.has_time) return "Missing";
          return "Complete";
        }
      },
      // Policy: "Location of fall (room, area)"
      {
        id: "d1_location",
        field: "Location of fall",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the location where the fall occurred stated (e.g. room number, corridor, bathroom)?" }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Whether the fall was witnessed"
      {
        id: "d1_witnessed",
        field: "Witnessed status",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Does the note state whether the fall was witnessed or unwitnessed? Phrases like 'witnessed by [name]' or 'found on floor' (implying unwitnessed) count." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Resident condition — pain level (use 0–10 scale)"
      {
        id: "d1_pain",
        field: "Pain scale not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is pain or lack of pain mentioned anywhere in the note? e.g. 'complaining of hip pain', 'no pain', 'pain rated 2/10'" },
          has_numeric_score: { type: "boolean", description: "Is there a specific numeric 0-10 pain score? e.g. '2/10', 'pain 5 out of 10'. General descriptions like 'complaining of pain' without a number = false." }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.has_numeric_score) return "Missing";
          return "Complete";
        }
      },
      // Policy: "Resident condition — consciousness"
      {
        id: "d1_consciousness",
        field: "Consciousness not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the resident's level of consciousness mentioned? e.g. 'alert and orientated', 'confused', 'responsive'. Any mention of mental state counts." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Resident condition — visible injury"
      {
        id: "d1_visible_injury",
        field: "Visible injury not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the presence or absence of visible injury mentioned? e.g. 'no visible injury', 'laceration to forehead', 'bruising noted'" }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Resident condition — ability to move all limbs"
      {
        id: "d1_limb_movement",
        field: "Limb movement not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Does the note explicitly state whether the resident can move their limbs? ONLY the following count: 'moving all limbs', 'unable to move left arm', 'full range of motion'. These do NOT count: 'no visible injury', 'assisted to wheelchair', 'complaining of hip pain' — these describe injury or assistance, not limb movement ability." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Vital signs taken (BP, HR, RR, Temperature, SpO2)"
      {
        id: "d1_vitals",
        field: "Vital signs not recorded",
        extractionSchema: {
          bp: { type: "boolean", description: "Is Blood Pressure (BP) recorded with an actual value (e.g. '130/80')?" },
          hr: { type: "boolean", description: "Is Heart Rate (HR) recorded with an actual value?" },
          rr: { type: "boolean", description: "Is Respiratory Rate (RR) recorded with an actual value?" },
          temp: { type: "boolean", description: "Is Temperature recorded with an actual value?" },
          spo2: { type: "boolean", description: "Is SpO2 recorded with an actual value (e.g. '98%')?" }
        },
        evaluate: (data) => {
          if (data.bp && data.hr && data.rr && data.temp && data.spo2) return "Complete";
          return "Missing";
        }
      },
      // Policy: "Immediate actions taken"
      {
        id: "d1_immediate_actions",
        field: "Immediate actions not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Are any immediate actions taken after the fall documented? e.g. 'assisted to bed', 'applied ice', 'comfort measures', 'assessed for injury before assisting up'" }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "GP name, time notified, and advice given"
      {
        id: "d1_gp_notification",
        field: "GP notification time not documented",
        extractionSchema: {
          gp_notified: { type: "boolean", description: "Does the note state the GP was notified/called?" },
          gp_name_documented: { type: "boolean", description: "Is the GP's name documented? e.g. 'Dr Kevin Park', 'Dr Sarah Jenkins'" },
          time_documented: { type: "boolean", description: "Is the exact time the GP was called documented? e.g. 'notified at 07:30'. Just saying 'GP notified' without a time = false." }
        },
        evaluate: (data) => {
          if (!data.gp_notified) return "Missing";
          if (!data.gp_name_documented || !data.time_documented) return "Missing";
          return "Complete";
        }
      },
      // Policy: "NOK name, time notified, and their response"
      {
        id: "d1_nok_notification",
        field: "NOK name and notification time absent",
        extractionSchema: {
          nok_notified: { type: "boolean", description: "Does the note state that the Next of Kin (NOK) or family was notified? e.g. 'family has been informed', 'daughter notified'" },
          nok_name_documented: { type: "boolean", description: "Is the specific NOK's name documented? e.g. 'daughter Jane'. Just saying 'family' without a name = false." },
          time_documented: { type: "boolean", description: "Is the exact time the NOK was called documented? e.g. 'notified at 07:45'. Just saying 'family informed' without a time = false." }
        },
        evaluate: (data) => {
          if (!data.nok_notified) return "Missing";
          if (!data.nok_name_documented || !data.time_documented) return "Missing";
          return "Complete";
        }
      },
      // Policy: "Any conditional actions advised by GP (e.g. X-ray if pain worsens, hospital transfer threshold)"
      {
        id: "d1_gp_conditional",
        field: "GP conditional actions not documented",
        extractionSchema: {
          has_conditional_actions: { type: "boolean", description: "Did the GP advise specific conditional actions with clear thresholds or triggers? EXAMPLES that ARE conditional: 'X-ray if pain worsens', 'call if pain > 5/10', 'transfer to hospital if GCS drops'. EXAMPLES that are NOT conditional: 'advised to monitor', 'continue observations', 'keep comfortable'. Generic monitoring advice without specific triggers or thresholds = false." }
        },
        evaluate: (data) => data.has_conditional_actions ? "Complete" : "Missing"
      },
      // Policy: "Risk factors identified (falls history, medications, mobility aid status)"
      {
        id: "d1_risk_factors",
        field: "Risk factors not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Are any risk factors identified? e.g. 'history of falls', 'on blood pressure medication', 'uses walker'. At least one risk factor mentioned = true." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Whether care plan has been reviewed and updated — Yes or No"
      {
        id: "d1_care_plan_review",
        field: "Care plan update unconfirmed",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the care plan mentioned at all? e.g. 'care plan updated', 'will update care plan'" },
          is_confirmed: { type: "boolean", description: "Is the care plan explicitly confirmed as already reviewed and updated? 'Reviewed and updated — Yes' = true. 'Will update' = false (it's planned, not done). The policy requires a Yes or No answer." }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.is_confirmed) return "Vague";
          return "Complete";
        }
      },
      // Policy: "Falls risk score reassessed and recorded"
      {
        id: "d1_risk_score",
        field: "Falls risk score not reassessed",
        extractionSchema: {
          reassessed: { type: "boolean", description: "Is a reassessed falls risk score documented? e.g. 'Falls risk score reassessed', 'falls risk: High'. The score must be explicitly mentioned as reassessed or recorded after this fall." }
        },
        evaluate: (data) => data.reassessed ? "Complete" : "Missing"
      },
      // Policy (Immediate Response #9): "Check and document whether a mobility aid was available and within reach at time of fall"
      {
        id: "d1_mobility_aid",
        field: "Mobility aid availability not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Does the note explicitly state whether a mobility aid (walker, frame, walking stick) was within reach or available at the time of the fall? COUNTS: 'walker was out of reach', 'mobility aid not used', 'frame beside bed'. DOES NOT COUNT: 'assisted back to wheelchair' (this describes what happened AFTER the fall, not whether an aid was available BEFORE it). 'History of falls' or 'uses walker' in risk factors also does NOT count — the policy asks specifically whether the aid was within reach at time of fall." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      }
    ]
  },
  day2: {
    label: "Day 2 — Continuation Note",
    requirements: [
      // Policy: "Current pain status — has it improved, worsened, or resolved? Use the 0–10 scale."
      {
        id: "d2_pain",
        field: "Pain status not updated",
        extractionSchema: {
          pain_updated: { type: "boolean", description: "Is the current pain status mentioned or updated in any way? e.g. 'pain resolved', 'still sore', 'no complaints of pain'. Any reference to pain or comfort on Day 2." },
          has_numeric_score: { type: "boolean", description: "Is there a numeric 0-10 pain score for Day 2? e.g. 'pain 0/10', 'rated 3 out of 10'. Descriptions like 'pain resolved' without a number = false." }
        },
        evaluate: (data) => {
          if (!data.pain_updated) return "Missing";
          if (!data.has_numeric_score) return "Missing";
          return "Complete";
        }
      },
      // Policy: "Mobility status — can the resident full weight-bear without pain? State clearly, not just 'moving around'."
      {
        id: "d2_mobility",
        field: "Mobility status unclear",
        extractionSchema: {
          mobility_mentioned: { type: "boolean", description: "Is mobility, physical status, or how the resident is moving mentioned at all, even vaguely? e.g. 'seems okay', 'walking around', 'mobilising', 'ate breakfast' (implies functioning). Set true if ANY physical activity or general wellbeing is mentioned." },
          can_full_weight_bear: { type: "boolean", description: "Does it EXPLICITLY state whether the resident can full weight-bear without pain? This requires clear clinical language like 'can full weight-bear without pain', 'ambulating independently'. Vague phrases like 'seems okay', 'moving around', 'ate breakfast' = false." }
        },
        evaluate: (data) => {
          if (!data.mobility_mentioned) return "Missing";
          if (!data.can_full_weight_bear) return "Vague";
          return "Complete";
        }
      },
      // Policy: "Any new symptoms since Day 1 (e.g. new bruising, swelling, confusion, behaviour change)"
      {
        id: "d2_new_symptoms",
        field: "New symptoms not assessed",
        extractionSchema: {
          assessed: { type: "boolean", description: "Does the note explicitly address whether there are any new symptoms since Day 1? COUNTS: 'no new bruising or swelling', 'new bruise on left hip noted', 'no changes since yesterday'. DOES NOT COUNT: simply not mentioning symptoms — the note must actively address this question." }
        },
        evaluate: (data) => data.assessed ? "Complete" : "Missing"
      },
      // Policy: "Vital signs — at least one full set of observations"
      {
        id: "d2_vitals",
        field: "Vital signs not recorded",
        extractionSchema: {
          has_full_set: { type: "boolean", description: "Is at least one full set of vital signs recorded on Day 2? A full set means BP, HR, RR, Temperature, and SpO2 — all five must be present with values." }
        },
        evaluate: (data) => data.has_full_set ? "Complete" : "Missing"
      },
      // Policy: "GP follow-up — has any conditional action from Day 1 been actioned?"
      {
        id: "d2_gp_followup",
        field: "GP follow-up not documented",
        extractionSchema: {
          gp_updated_or_actioned: { type: "boolean", description: "Does the note document whether the GP was updated on Day 2, or whether any conditional actions from Day 1 were actioned? e.g. 'GP reviewed', 'X-ray arranged as per GP advice', 'monitored per GP advice, no escalation needed'. The note must actively address GP follow-up." }
        },
        evaluate: (data) => data.gp_updated_or_actioned ? "Complete" : "Missing"
      },
      // Policy: "Any changes to the care plan since Day 1"
      {
        id: "d2_care_plan_changes",
        field: "Care plan changes not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Does the note mention any changes to the care plan, or explicitly state there are no changes? e.g. 'care plan updated to include...', 'no changes to care plan', 'reminded to keep walker within reach'. Must actively address the care plan." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      }
    ]
  },
  day3: {
    label: "Day 3 — Closure or Escalation Note",
    requirements: [
      // Policy: "Pain outcome — confirmed resolved, or documented as ongoing with escalation plan"
      {
        id: "d3_pain_outcome",
        field: "Pain outcome not clinically confirmed",
        extractionSchema: {
          pain_mentioned: { type: "boolean", description: "Is pain, comfort, physical wellbeing, or general condition mentioned at all? e.g. 'doing much better', 'pain free', 'comfortable', 'no complaints'. Set true if any reference to how the resident feels physically." },
          clinically_confirmed: { type: "boolean", description: "Is the pain outcome CLINICALLY confirmed as either resolved or ongoing with a plan? COUNTS: 'pain resolved', 'pain free — no further action', 'ongoing hip pain — referred to physio'. DOES NOT COUNT: 'doing much better', 'seems fine', 'no complaints' — these are vague and not clinical confirmations." }
        },
        evaluate: (data) => {
          if (!data.pain_mentioned) return "Missing";
          if (!data.clinically_confirmed) return "Vague";
          return "Complete";
        }
      },
      // Policy: "Mobility — confirmed returned to baseline, or documented as reduced with follow-up plan"
      {
        id: "d3_mobility",
        field: "Mobility not confirmed at baseline",
        extractionSchema: {
          mobility_mentioned: { type: "boolean", description: "Is mobility, fall status, or physical capability mentioned at all? e.g. 'no further falls', 'walking independently', 'still using wheelchair'. Any reference to movement or fall recurrence." },
          confirmed_at_baseline: { type: "boolean", description: "Is mobility EXPLICITLY confirmed as returned to baseline, or documented as reduced with a follow-up plan? COUNTS: 'returned to baseline', 'independent with walker', 'mobility reduced — physio referral'. DOES NOT COUNT: 'no further falls', 'getting around okay' — these don't confirm baseline status." }
        },
        evaluate: (data) => {
          if (!data.mobility_mentioned) return "Missing";
          if (!data.confirmed_at_baseline) return "Vague";
          return "Complete";
        }
      },
      // Policy: "Resolution of any outstanding actions from Day 1 or Day 2 (e.g. X-ray result, GP review outcome)"
      {
        id: "d3_outstanding_actions",
        field: "Outstanding actions not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Does the note address outstanding actions from Day 1 or Day 2? e.g. 'X-ray results came back normal', 'GP reviewed — no concerns', 'all actions completed', 'no outstanding actions'. The note must actively address whether prior actions have been resolved." }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      // Policy: "Formal incident closure — state that the post-fall monitoring period is complete"
      {
        id: "d3_incident_closure",
        field: "Incident not formally closed",
        extractionSchema: {
          formally_closed: { type: "boolean", description: "Does the note formally state that the post-fall monitoring period is complete and the incident is closed? e.g. 'post-fall monitoring period is complete', 'incident closed', 'fall incident concluded'. Must be an explicit closure statement." }
        },
        evaluate: (data) => data.formally_closed ? "Complete" : "Missing"
      },
      // Policy: "Falls prevention plan reviewed — confirm the updated care plan has been discussed with resident and/or family"
      {
        id: "d3_prevention_plan",
        field: "Falls prevention plan not reviewed",
        extractionSchema: {
          reviewed: { type: "boolean", description: "Does the note confirm the updated falls prevention plan was reviewed or discussed with the resident and/or family? e.g. 'falls prevention plan reviewed with resident and daughter', 'care plan discussed with family'. Must specifically mention review/discussion of the prevention plan." }
        },
        evaluate: (data) => data.reviewed ? "Complete" : "Missing"
      },
      // Policy: "If the resident has not stabilised by Day 3, escalate to the care manager and document the escalation"
      {
        id: "d3_escalation",
        field: "Escalation not documented",
        extractionSchema: {
          has_unresolved_issues: { type: "boolean", description: "Does the Day 3 note indicate the resident has CLEAR, EXPLICIT unresolved clinical issues? Examples: 'still in significant pain', 'mobility has not improved', 'new swelling observed'. Vague positive language like 'doing much better' or 'no further falls' does NOT indicate unresolved issues — treat those as the resident trending towards stabilisation." },
          escalated: { type: "boolean", description: "If there ARE clear unresolved issues, was the case escalated to a care manager or senior clinician? e.g. 'escalated to care manager', 'referred to specialist'" }
        },
        evaluate: (data) => {
          if (data.has_unresolved_issues && !data.escalated) return "Missing";
          return "Complete";
        }
      }
    ]
  }
};
