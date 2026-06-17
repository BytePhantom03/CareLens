import { AI_CONFIG } from '../config/ai.config.js';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getEnv(key) {
  // 1. Check user-provided overrides in localStorage first
  if (typeof window !== 'undefined' && window.localStorage) {
    const localVal = window.localStorage.getItem(key);
    if (localVal && localVal.trim()) return localVal.trim();
  }

  // 2. Fall back to environment variables
  let val = null;
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    val = process.env[key];
  } else {
    try { val = import.meta.env[key]; } catch (_) {}
  }
  return val && val.trim() ? val.trim() : null;
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
      const err = new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      err.retryable = (response.status >= 500);
      throw err;
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

async function callOpenAICompatible(baseUrl, apiKey, model, systemPrompt, userPrompt, responseSchema, providerName) {
  const url = `${baseUrl}/chat/completions`;

  const sysContent = responseSchema
    ? `${systemPrompt}\n\nYou MUST respond with ONLY a valid JSON object. No markdown, no explanation, just JSON.`
    : systemPrompt;

  const payload = {
    model,
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

    if (response.status === 429 || response.status === 503) {
      const err = new Error(`${providerName}_RATE_LIMIT:${response.status}`);
      err.status = response.status;
      err.retryable = true;
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(`${providerName} API error: ${response.status} - ${JSON.stringify(errorData)}`);
      // 401=unauthorized, 400=bad request — these won't fix on retry, skip immediately
      err.retryable = (response.status >= 500);
      throw err;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (responseSchema) {
      return JSON.parse(content);
    }
    return content;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`${providerName} request timed out after 30s`);
      timeoutErr.retryable = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const providerCooldowns = {};

function isProviderCoolingDown(name) {
  return providerCooldowns[name] && Date.now() < providerCooldowns[name];
}

function setProviderCooldown(name, seconds) {
  providerCooldowns[name] = Date.now() + (seconds * 1000);
}

export async function callGemini(systemPrompt, userPrompt, responseSchema = null) {
  const openAIKey   = getEnv('VITE_OPENAI_API_KEY');
  const githubToken = getEnv('VITE_GITHUB_TOKEN');
  const groqKey     = getEnv('VITE_GROQ_API_KEY');
  const geminiKey1  = getEnv('VITE_GEMINI_API_KEY');
  const geminiKey2  = getEnv('VITE_GEMINI_API_KEY_2');

  const providers = [];

  if (openAIKey) {
    providers.push({
      name: 'OpenAI',
      fn: () => callOpenAICompatible(AI_CONFIG.openai.baseUrl, openAIKey, AI_CONFIG.openai.model, systemPrompt, userPrompt, responseSchema, 'OpenAI')
    });
  }
  if (githubToken) {
    providers.push({
      name: 'GitHub Models',
      fn: () => callOpenAICompatible(AI_CONFIG.github.baseUrl, githubToken, AI_CONFIG.github.model, systemPrompt, userPrompt, responseSchema, 'GitHub')
    });
  }
  if (groqKey) {
    providers.push({
      name: 'Groq',
      fn: () => callOpenAICompatible('https://api.groq.com/openai/v1', groqKey, AI_CONFIG.groq.model, systemPrompt, userPrompt, responseSchema, 'Groq')
    });
  }
  if (geminiKey1) {
    providers.push({
      name: 'Gemini (primary)',
      fn: () => callGeminiWithKey(geminiKey1, systemPrompt, userPrompt, responseSchema)
    });
  }
  if (geminiKey2) {
    providers.push({
      name: 'Gemini (alt)',
      fn: () => callGeminiWithKey(geminiKey2, systemPrompt, userPrompt, responseSchema)
    });
  }

  if (providers.length === 0) {
    throw new Error('No AI API keys configured. Add at least one key to your .env file.');
  }

  const availableProviders = providers.filter(p => !isProviderCoolingDown(p.name));

  if (availableProviders.length === 0) {
    throw new Error('RATE_LIMIT_EXCEEDED: All AI providers are currently rate limited.');
  }

  let lastError = null;

  for (const provider of availableProviders) {
    try {
      return await provider.fn();
    } catch (err) {
      lastError = err;

      if (err.status === 429 || err.status === 503 || (err.message && err.message.includes('RATE_LIMIT'))) {
        console.warn(`[${provider.name}] Rate limit hit. Cooling down for 15s.`);
        setProviderCooldown(provider.name, 15);
        continue; // Fall through immediately to next provider
      }

      // For other errors, just try the next provider
      continue;
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

