import { FALLS_POLICY } from '../data/policy.js';
import { callGemini } from './geminiClient.js';
import {
  buildExtractionSystemPrompt,
  buildExtractionUserPrompt,
  buildExtractionSchema,
  buildExtractionSchemaExample,
  buildExplanationSystemPrompt,
  buildExplanationUserPrompt,
  buildExplanationSchema,
  buildExplanationSchemaExample
} from '../utils/promptBuilder.js';

export async function checkNote(note, dayNumber) {
  const dayKey = `day${dayNumber}`;
  const policyForDay = FALLS_POLICY[dayKey];
  if (!policyForDay) {
    throw new Error(`Invalid day number: ${dayNumber}`);
  }
  const requirements = policyForDay.requirements;

  const schemaExample = buildExtractionSchemaExample(requirements);
  const extSysPrompt = buildExtractionSystemPrompt(policyForDay.label, schemaExample);
  const extUserPrompt = buildExtractionUserPrompt(note);
  const extSchema = buildExtractionSchema(requirements);

  const extractedData = await callGemini(extSysPrompt, extUserPrompt, extSchema);

  const evaluatedFlags = requirements.map(req => {
    const data = extractedData[req.id] || {};
    const status = req.evaluate(data);

    const ruleDesc = Object.values(req.extractionSchema).map(s => s.description || '').join(' ');

    return {
      id: req.id,
      field: req.field,
      rule: ruleDesc,
      status: status,
    };
  });

  const issueFlags = evaluatedFlags.filter(f => f.status !== "Complete");

  if (issueFlags.length === 0) {
    return {
      day: `Day ${dayNumber}`,
      overall_status: "complete",
      flags: [
        {
          flag_type: "Complete",
          field: "All fields present",
          explanation: "No flags raised"
        }
      ]
    };
  }

  const expSchemaExample = buildExplanationSchemaExample(issueFlags);
  const expSysPrompt = buildExplanationSystemPrompt(expSchemaExample);
  const expUserPrompt = buildExplanationUserPrompt(note, issueFlags);
  const expSchema = buildExplanationSchema(issueFlags);

  const explanations = await callGemini(expSysPrompt, expUserPrompt, expSchema);

  const finalFlags = issueFlags.map(f => {
    let flagType = "Missing";
    if (f.status === "Vague") flagType = "Vague";

    return {
      flag_type: flagType,
      field: f.field,
      explanation: explanations[f.id] || `Policy requires: ${f.rule}`
    };
  });

  finalFlags.sort((a, b) => {
    if (a.flag_type === b.flag_type) return 0;
    if (a.flag_type === "Missing") return -1;
    return 1;
  });

  return {
    day: `Day ${dayNumber}`,
    overall_status: "has_issues",
    flags: finalFlags
  };
}
