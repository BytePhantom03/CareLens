export function buildExtractionSystemPrompt(dayLabel) {
  return `You are a clinical data extraction assistant for an aged care facility.
Your task is to analyze a nurse's progress note and extract structured boolean flags based on specific policy requirements.
This note is for: ${dayLabel}.
If a field requires a specific numeric scale, confirm if that numeric scale is actually present in the text.
Do not infer information that is not explicitly stated.
Return only a JSON object matching the requested schema.`;
}

export function buildExtractionUserPrompt(note) {
  return `Progress Note:
"""
${note}
"""

Extract the requested fields.`;
}

export function buildExtractionSchema(requirements) {
  const properties = {};
  for (const req of requirements) {
    properties[req.id] = {
      type: "OBJECT",
      properties: {},
      required: []
    };
    for (const [key, prop] of Object.entries(req.extractionSchema)) {
      properties[req.id].properties[key] = {
        type: prop.type.toUpperCase(),
        description: prop.description
      };
      properties[req.id].required.push(key);
    }
  }

  return {
    type: "OBJECT",
    properties,
    required: Object.keys(properties)
  };
}

export function buildExplanationSystemPrompt() {
  return `You are a clinical documentation coach.
Your task is to generate short, actionable explanations for why a progress note failed specific policy requirements.
The explanation MUST reference the policy requirement, and point out exactly what is missing or vague in the note.
Do not use clinical jargon. Keep it direct and nurse-friendly.
Format: "Policy requires [X]. [What is missing/vague]."
Return a JSON object where the key is the requirement ID and the value is the explanation string.`;
}

export function buildExplanationUserPrompt(note, flags) {
  const flagsText = flags.map(f => `- ${f.id} (${f.field}): Evaluated as ${f.status}. Rule: ${f.rule}`).join('\\n');
  return `Progress Note:
"""
${note}
"""

The following requirements were flagged as Missing or Vague:
${flagsText}

Generate an explanation for each flagged requirement.`;
}

export function buildExplanationSchema(flags) {
  const properties = {};
  for (const flag of flags) {
    properties[flag.id] = {
      type: "STRING",
      description: `Explanation for why ${flag.field} is ${flag.status}.`
    };
  }

  return {
    type: "OBJECT",
    properties,
    required: flags.map(f => f.id)
  };
}
