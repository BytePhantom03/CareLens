export const AI_CONFIG = {
  temperature: 0.1,
  maxOutputTokens: 2048,

  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },

  gemini: {
    model: 'gemini-2.5-flash-lite',
  },

  groq: {
    model: 'llama-3.1-70b-versatile',
  },

  github: {
    baseUrl: 'https://models.github.ai/inference',
    model: 'openai/gpt-4.1-mini',
  },

  retry: {
    maxAttempts: 2,
    baseDelayMs: 1500,
  }
};
