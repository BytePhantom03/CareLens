export function buildExtractionSystemPrompt(dayLabel, schemaForPrompt = null) {
  const base = `You are an expert clinical data extraction AI for an aged care facility.
Your task is to analyze a nurse's progress note and extract structured boolean flags based on specific policy requirements for ${dayLabel}.

CRITICAL INSTRUCTIONS:

1. 'MENTIONED' FIELDS — LIBERAL THRESHOLD:
   Many fields have a 'mentioned' boolean. Set it to TRUE if the nurse touches on the topic in ANY way, including vague or informal language.
   EXAMPLES OF PHRASES THAT COUNT AS 'mentioned = true':
   - "seems okay" → mobility_mentioned = true, pain_mentioned = true
   - "doing much better" → pain_mentioned = true
   - "no further falls" → mobility_mentioned = true
   - "will update" → mentioned = true (for care plan)
   - "comfortable" → pain_mentioned = true
   - "resting well" → pain_mentioned = true
   - "mobilising slowly" → mobility_mentioned = true
   Only set 'mentioned' to FALSE if the topic is COMPLETELY ABSENT from the entire note.

2. 'SPECIFIC CLINICAL REQUIREMENT' FIELDS — STRICT THRESHOLD:
   Fields like 'has_numeric_score', 'clinically_confirmed', 'confirmed_at_baseline', 'can_full_weight_bear' require EXPLICIT clinical documentation.
   - "seems okay" does NOT confirm full weight-bearing → can_full_weight_bear = false
   - "doing much better" does NOT clinically confirm pain resolution → clinically_confirmed = false
   - "no further falls" does NOT confirm baseline mobility → confirmed_at_baseline = false

3. DEFINITIONS: Read the description of each JSON field extremely carefully. If a field's description states that a certain condition counts as 'true', you MUST mark it as true, even if the exact keyword isn't used.

4. Do not infer clinical information beyond what the field descriptions explicitly permit.`;


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
