import { AI_CONFIG } from '../config/ai.config.js';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getEnv(key) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    return import.meta.env[key] || null;
  } catch (_) {
    return null;
  }
}

async function callGeminiWithKey(apiKey, systemPrompt, userPrompt, responseSchema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.gemini.model}:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
    },
  };

  if (responseSchema) {
    payload.generationConfig.responseMimeType = 'application/json';
    payload.generationConfig.responseSchema = responseSchema;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.status === 503 || response.status === 429) {
      const err = new Error(`GEMINI_RATE_LIMIT:${response.status}`);
      err.status = response.status;
      err.retryable = true;
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (responseSchema) {
      return JSON.parse(content);
    }
    return content;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Gemini request timed out after 30s');
      timeoutErr.retryable = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGroq(apiKey, systemPrompt, userPrompt, responseSchema) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const sysContent = responseSchema
    ? `${systemPrompt}\n\nYou MUST respond with ONLY a valid JSON object. No markdown, no explanation, just JSON.`
    : systemPrompt;

  const payload = {
    model: AI_CONFIG.groq.model,
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxOutputTokens,
    messages: [
      { role: 'system', content: sysContent },
      { role: 'user', content: userPrompt },
    ],
  };

  if (responseSchema) {
    payload.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.status === 429) {
      const err = new Error('GROQ_RATE_LIMIT:429');
      err.status = 429;
      err.retryable = true;
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (responseSchema) {
      return JSON.parse(content);
    }
    return content;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Groq request timed out after 30s');
      timeoutErr.retryable = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callGemini(systemPrompt, userPrompt, responseSchema = null) {
  const geminiKey1 = getEnv('VITE_GEMINI_API_KEY');
  const geminiKey2 = getEnv('VITE_GEMINI_API_KEY_2');
  const groqKey = getEnv('VITE_GROQ_API_KEY');

  const providers = [];
  if (geminiKey1) providers.push({ name: 'Gemini (primary)', fn: () => callGeminiWithKey(geminiKey1, systemPrompt, userPrompt, responseSchema) });
  if (geminiKey2) providers.push({ name: 'Gemini (alt)',     fn: () => callGeminiWithKey(geminiKey2, systemPrompt, userPrompt, responseSchema) });
  if (groqKey)   providers.push({ name: 'Groq',             fn: () => callGroq(groqKey, systemPrompt, userPrompt, responseSchema) });

  if (providers.length === 0) {
    throw new Error('No AI API keys configured. Add VITE_GEMINI_API_KEY, VITE_GEMINI_API_KEY_2, or VITE_GROQ_API_KEY to your .env file.');
  }

  const { maxAttempts, baseDelayMs } = AI_CONFIG.retry;
  let lastError = null;

  for (const provider of providers) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await provider.fn();
        return result;
      } catch (err) {
        lastError = err;

        if (!err.retryable) {
          break;
        }

        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}
