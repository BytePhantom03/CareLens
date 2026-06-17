export const FALLS_POLICY = {
  metadata: {
    policyNumber: "POL-FAL-001",
    version: "1.0",
    effectiveDate: "2025-06-01"
  },
  day1: {
    label: "Day 1 — Incident Report",
    requirements: [
      {
        id: "d1_datetime",
        field: "Date and time of fall",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the fall mentioned?" },
          has_date: { type: "boolean", description: "Is the exact date of the fall stated?" },
          has_time: { type: "boolean", description: "Is the exact time of the fall stated?" }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.has_date || !data.has_time) return "Missing";
          return "Complete";
        }
      },
      {
        id: "d1_location",
        field: "Location of fall",
        extractionSchema: { mentioned: { type: "boolean" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_witnessed",
        field: "Witnessed status",
        extractionSchema: { mentioned: { type: "boolean", description: "Does it state whether it was witnessed or unwitnessed?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_pain",
        field: "Pain scale not documented", // Name matches Peter Parker output
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is pain or lack of pain mentioned?" },
          has_numeric_score: { type: "boolean", description: "Is there a numeric 0-10 score given for pain?" }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.has_numeric_score) return "Missing";
          return "Complete";
        }
      },
      {
        id: "d1_consciousness",
        field: "Consciousness not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Is the level of consciousness (e.g. alert) mentioned?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_visible_injury",
        field: "Visible injury not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Is presence or absence of visible injury mentioned?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_limb_movement",
        field: "Limb movement not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Is the ability to move limbs mentioned?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_vitals",
        field: "Vital signs not recorded",
        extractionSchema: {
          bp: { type: "boolean", description: "Is Blood Pressure (BP) recorded with a value?" },
          hr: { type: "boolean", description: "Is Heart Rate (HR) recorded with a value?" },
          rr: { type: "boolean", description: "Is Respiratory Rate (RR) recorded with a value?" },
          temp: { type: "boolean", description: "Is Temperature recorded with a value?" },
          spo2: { type: "boolean", description: "Is SpO2 recorded with a value?" }
        },
        evaluate: (data) => {
          if (data.bp && data.hr && data.rr && data.temp && data.spo2) return "Complete";
          return "Missing";
        }
      },
      {
        id: "d1_immediate_actions",
        field: "Immediate actions not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Are immediate actions taken after the fall documented?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_gp_notification",
        field: "GP notification time not documented",
        extractionSchema: {
          gp_notified: { type: "boolean", description: "Was the GP notified?" },
          gp_name_documented: { type: "boolean", description: "Is the GP's name documented?" },
          time_documented: { type: "boolean", description: "Is the exact time of the GP call documented?" }
        },
        evaluate: (data) => {
          if (!data.gp_notified) return "Missing";
          if (!data.gp_name_documented || !data.time_documented) return "Missing";
          return "Complete";
        }
      },
      {
        id: "d1_nok_notification",
        field: "NOK name and notification time absent",
        extractionSchema: {
          nok_notified: { type: "boolean", description: "Was the Next of Kin (NOK) or family notified?" },
          nok_name_documented: { type: "boolean", description: "Is the NOK's name documented?" },
          time_documented: { type: "boolean", description: "Is the exact time of the NOK call documented?" }
        },
        evaluate: (data) => {
          if (!data.nok_notified) return "Missing";
          if (!data.nok_name_documented || !data.time_documented) return "Missing";
          return "Complete";
        }
      },
      {
        id: "d1_gp_conditional",
        field: "GP conditional actions not documented",
        extractionSchema: {
          has_conditional_actions: { type: "boolean", description: "Did the GP advise specific conditional actions (e.g. thresholds for hospital, 'call if X happens')? 'Advised to monitor' without conditions is false." }
        },
        evaluate: (data) => data.has_conditional_actions ? "Complete" : "Missing"
      },
      {
        id: "d1_risk_factors",
        field: "Risk factors not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Are risk factors (e.g. history, meds) identified?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d1_care_plan_review",
        field: "Care plan update unconfirmed",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Is the care plan update mentioned?" },
          is_confirmed: { type: "boolean", description: "Is it explicitly confirmed as updated (Yes), or just planned ('will update')?" }
        },
        evaluate: (data) => {
          if (!data.mentioned) return "Missing";
          if (!data.is_confirmed) return "Vague";
          return "Complete";
        }
      },
      {
        id: "d1_risk_score",
        field: "Falls risk score not reassessed",
        extractionSchema: {
          reassessed: { type: "boolean", description: "Is a reassessed falls risk score documented?" }
        },
        evaluate: (data) => data.reassessed ? "Complete" : "Missing"
      },
      {
        id: "d1_mobility_aid",
        field: "Mobility aid availability not documented",
        extractionSchema: { mentioned: { type: "boolean", description: "Is it stated whether a mobility aid was in reach?" } },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      }
    ]
  },
  day2: {
    label: "Day 2 — Continuation Note",
    requirements: [
      {
        id: "d2_pain",
        field: "Pain status not updated",
        extractionSchema: {
          pain_updated: { type: "boolean", description: "Is the pain status explicitly updated?" },
          has_numeric_score: { type: "boolean", description: "Is there a numeric 0-10 score given for the updated pain?" }
        },
        evaluate: (data) => {
          if (!data.pain_updated) return "Missing";
          if (!data.has_numeric_score) return "Missing";
          return "Complete";
        }
      },
      {
        id: "d2_mobility",
        field: "Mobility status unclear",
        extractionSchema: {
          mobility_mentioned: { type: "boolean", description: "Is mobility or general physical status mentioned, even vaguely (e.g. 'seems okay')?" },
          can_full_weight_bear: { type: "boolean", description: "Does it explicitly state if the resident can full weight-bear without pain? ('seems okay' is false)" }
        },
        evaluate: (data) => {
          if (!data.mobility_mentioned) return "Missing";
          if (!data.can_full_weight_bear) return "Vague";
          return "Complete";
        }
      },
      {
        id: "d2_new_symptoms",
        field: "New symptoms not assessed",
        extractionSchema: {
          assessed: { type: "boolean", description: "Does it explicitly state whether there are new symptoms since Day 1 (bruising, swelling, confusion, etc.)?" }
        },
        evaluate: (data) => data.assessed ? "Complete" : "Missing"
      },
      {
        id: "d2_vitals",
        field: "Vital signs not recorded",
        extractionSchema: {
          has_full_set: { type: "boolean", description: "Is at least one full set of vital signs (BP, HR, RR, Temp, SpO2) recorded?" }
        },
        evaluate: (data) => data.has_full_set ? "Complete" : "Missing"
      },
      {
        id: "d2_gp_followup",
        field: "GP follow-up not documented",
        extractionSchema: {
          gp_updated_or_actioned: { type: "boolean", description: "Does it document whether the GP was updated, or if Day 1 conditional actions were actioned?" }
        },
        evaluate: (data) => data.gp_updated_or_actioned ? "Complete" : "Missing"
      },
      {
        id: "d2_care_plan_changes",
        field: "Care plan changes not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Are any changes to the care plan documented, or explicitly stated as none?" }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      }
    ]
  },
  day3: {
    label: "Day 3 — Closure or Escalation Note",
    requirements: [
      {
        id: "d3_pain_outcome",
        field: "Pain outcome not clinically confirmed",
        extractionSchema: {
          pain_mentioned: { type: "boolean", description: "Is pain, comfort, or general physical wellbeing mentioned, even vaguely (e.g. 'doing much better')?" },
          clinically_confirmed: { type: "boolean", description: "Is it clinically confirmed as resolved or ongoing with escalation? ('doing much better' is false)" }
        },
        evaluate: (data) => {
          if (!data.pain_mentioned) return "Missing";
          if (!data.clinically_confirmed) return "Vague";
          return "Complete";
        }
      },
      {
        id: "d3_mobility",
        field: "Mobility not confirmed at baseline",
        extractionSchema: {
          mobility_mentioned: { type: "boolean", description: "Is mobility or fall status mentioned, even vaguely (e.g. 'no further falls')?" },
          confirmed_at_baseline: { type: "boolean", description: "Is it explicitly confirmed that mobility returned to baseline, or reduced with follow-up? ('no further falls' is false)" }
        },
        evaluate: (data) => {
          if (!data.mobility_mentioned) return "Missing";
          if (!data.confirmed_at_baseline) return "Vague";
          return "Complete";
        }
      },
      {
        id: "d3_outstanding_actions",
        field: "Outstanding actions not documented",
        extractionSchema: {
          mentioned: { type: "boolean", description: "Are outstanding actions from Day 1/2 explicitly addressed?" }
        },
        evaluate: (data) => data.mentioned ? "Complete" : "Missing"
      },
      {
        id: "d3_incident_closure",
        field: "Incident not formally closed",
        extractionSchema: {
          formally_closed: { type: "boolean", description: "Is it stated that the post-fall monitoring period is complete and incident closed?" }
        },
        evaluate: (data) => data.formally_closed ? "Complete" : "Missing"
      },
      {
        id: "d3_prevention_plan",
        field: "Falls prevention plan not reviewed",
        extractionSchema: {
          reviewed: { type: "boolean", description: "Is it confirmed the updated falls prevention plan was reviewed with resident/family?" }
        },
        evaluate: (data) => data.reviewed ? "Complete" : "Missing"
      },
      {
        id: "d3_escalation",
        field: "Escalation not documented",
        extractionSchema: {
          escalated: { type: "boolean", description: "If not stabilised, was it escalated?" },
          stabilised: { type: "boolean", description: "Is the resident clinically stabilised? (If pain is resolved and mobility is at baseline, or if incident is closed, they ARE considered stabilised)" }
        },
        evaluate: (data) => (!data.stabilised && !data.escalated) ? "Missing" : "Complete"
      }
    ]
  }
};
