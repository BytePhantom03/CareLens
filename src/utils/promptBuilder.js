export function buildExtractionSystemPrompt(dayLabel, schemaForPrompt = null) {
  const base = `You are an expert clinical data extraction AI for an aged care facility.
Your task is to analyze a nurse's progress note and extract structured boolean flags based on specific policy requirements for ${dayLabel}.

CRITICAL INSTRUCTIONS — READ CAREFULLY:

1. 'MENTIONED' FIELDS — LIBERAL THRESHOLD:
   Many fields have a 'mentioned' boolean. Set it to TRUE if the nurse touches on the topic in ANY way, including vague, informal, or indirect language.
   EXAMPLES OF PHRASES THAT COUNT AS 'mentioned = true':
   - "seems okay" → mobility_mentioned = true, pain_mentioned = true
   - "doing much better" → pain_mentioned = true
   - "no further falls" → mobility_mentioned = true
   - "will update" → mentioned = true (for care plan)
   - "comfortable" / "resting well" → pain_mentioned = true
   - "mobilising slowly" / "walking around" → mobility_mentioned = true
   Only set 'mentioned' to FALSE if the topic is COMPLETELY ABSENT from the entire note.

2. 'SPECIFIC CLINICAL REQUIREMENT' FIELDS — STRICT THRESHOLD:
   Fields like 'has_numeric_score', 'clinically_confirmed', 'confirmed_at_baseline', 'can_full_weight_bear' require EXPLICIT clinical documentation.
   - "seems okay" does NOT confirm full weight-bearing → can_full_weight_bear = false
   - "doing much better" does NOT clinically confirm pain resolution → clinically_confirmed = false
   - "no further falls" does NOT confirm baseline mobility → confirmed_at_baseline = false

3. DO NOT OVER-FLAG:
   This is critical. Only flag something as FALSE when the note genuinely does not contain the information.
   - If the note mentions injury assessment (e.g. "no visible injury") and describes how the resident was found, DO NOT additionally require separate limb movement documentation UNLESS the policy description explicitly asks for it AND the note truly says nothing about physical capability.
   - If the note describes assisting the resident to a wheelchair or walking, that implies some mobility assessment occurred. Consider contextual clues.
   - A phrase like "Assisted back to wheelchair" implies the resident was helped to move — this is an immediate action.

4. CONTEXTUAL READING:
   - "GP notified. Advised to monitor." → GP WAS notified (gp_notified = true), but if no specific conditional thresholds are given beyond generic 'monitor', has_conditional_actions = false.
   - "Family has been informed" → nok_notified = true, but if no name or time is given, nok_name_documented = false, time_documented = false.
   - "Will update" the care plan → mentioned = true, but is_confirmed = false (not yet done).

5. DEFINITIONS: Read the description of each JSON field extremely carefully. If a field's description states that a certain condition counts as 'true', you MUST mark it as true, even if the exact keyword isn't used.

6. Do not infer clinical information beyond what the field descriptions explicitly permit.
7. Do not add or invent flags that aren't in the schema.`;


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

Instructions:
1. Read the ENTIRE note carefully before answering any field.
2. For 'mentioned' fields: set true if the topic appears ANYWHERE in the note, even informally.
3. For specific clinical fields: only set true if explicitly documented.
4. Do NOT mark something as false if the information IS present in the note — re-read to be sure.
5. When in doubt about 'mentioned', lean towards true. When in doubt about clinical specifics, lean towards false.`;
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
  const base = `You are a clinical documentation coach for aged care facilities.
Your task is to generate short, actionable explanations for why a progress note failed specific policy requirements.

RULES:
1. Each explanation MUST follow this format: "Policy requires [specific requirement]. [What is missing or vague in the note]."
2. Reference the exact policy requirement that was not met.
3. Quote the relevant text from the note when something is vague (e.g., "Note states 'seems okay' but policy requires explicit weight-bearing confirmation.").
4. When something is completely absent, say so clearly (e.g., "No vital signs recorded.").
5. Keep explanations direct, nurse-friendly, and under 2 sentences.
6. Do NOT suggest what the nurse should have written — only state what is missing.`;

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

Generate a concise explanation for each flagged requirement. Reference the policy and quote the note where relevant.`;
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

export function buildExplanationSchemaExample(flags) {
  const example = {};
  for (const flag of flags) {
    example[flag.id] = `Explanation for ${flag.field}`;
  }
  return example;
}
