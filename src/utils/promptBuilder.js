export function buildExtractionSystemPrompt(dayLabel, schemaForPrompt = null) {
  const base = `You are an expert clinical data extraction AI for an aged care facility.
Your task is to analyze a nurse's progress note and extract structured boolean flags based on specific policy requirements for ${dayLabel}.

CRITICAL INSTRUCTIONS:
1. 'VAGUE' VS 'MISSING': Many fields use a two-part check: a 'mentioned' boolean and a 'specific clinical requirement' boolean.
   - If the nurse touches on the topic EVEN VAGUELY or uses general terms (e.g., "seems okay", "doing better", "no further falls", "will update"), you MUST set the 'mentioned' boolean to true.
   - Only set the 'specific clinical requirement' boolean (e.g. numeric score, baseline confirmation) to true if it is explicitly documented.
   - Only if the topic is completely absent should you set 'mentioned' to false (Missing).
2. DEFINITIONS: Read the description of each JSON field extremely carefully. If a field's description states that a certain condition counts as a 'true', you MUST mark it as true, even if the exact keyword isn't used.
3. Do not infer clinical information beyond what the field descriptions explicitly permit.`;

  if (schemaForPrompt) {
    return `${base}

You MUST return a JSON object that EXACTLY matches this structure (use true/false for booleans):
${JSON.stringify(schemaForPrompt, null, 2)}

Return ONLY the JSON object. No explanation, no markdown, no code blocks.`;
  }

  return `${base}\nReturn only a JSON object matching the requested schema.`;
}

export function buildExtractionUserPrompt(note) {
  return `Progress Note:
"""
${note}
"""

Extract the requested fields. Carefully read the ENTIRE note before answering. Do not mark something as false if the information IS present in the note.`;
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

// Build a plain JS object with default-false values to embed in the system prompt
// for OpenAI-compatible providers that don't support Gemini-style schema constraints
export function buildExtractionSchemaExample(requirements) {
  const example = {};
  for (const req of requirements) {
    example[req.id] = {};
    for (const key of Object.keys(req.extractionSchema)) {
      example[req.id][key] = false;
    }
  }
  return example;
}

export function buildExplanationSystemPrompt(schemaExample = null) {
  const base = `You are a clinical documentation coach.
Your task is to generate short, actionable explanations for why a progress note failed specific policy requirements.
The explanation MUST reference the policy requirement, and point out exactly what is missing or vague in the note.
Do not use clinical jargon. Keep it direct and nurse-friendly.
Format: "Policy requires [X]. [What is missing/vague]."`;

  if (schemaExample) {
    return `${base}

You MUST return a JSON object that EXACTLY matches this structure:
${JSON.stringify(schemaExample, null, 2)}

Return ONLY the JSON object. No explanation, no markdown, no code blocks.`;
  }

  return `${base}\nReturn a JSON object where the key is the requirement ID and the value is the explanation string.`;
}


export function buildExplanationUserPrompt(note, flags) {
  const flagsText = flags.map(f => `- ${f.id} (${f.field}): Evaluated as ${f.status}. Rule: ${f.rule}`).join('\n');
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

// Plain JS object for OpenAI-compatible explanation schema
export function buildExplanationSchemaExample(flags) {
  const example = {};
  for (const flag of flags) {
    example[flag.id] = `Explanation for ${flag.field}`;
  }
  return example;
}
