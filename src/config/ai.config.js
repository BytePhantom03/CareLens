// AI Provider Configuration
// Supports: Gemini (primary), Gemini (alt key), Groq (fallback)
export const AI_CONFIG = {
  temperature: 0.1,
  maxOutputTokens: 2048,

  // Gemini settings
  gemini: {
    model: 'gemini-2.5-flash-lite',
    // Primary key read from VITE_GEMINI_API_KEY
    // Alt key read from VITE_GEMINI_API_KEY_2
  },

  // Groq fallback settings (free tier, very generous limits)
  groq: {
    model: 'llama-3.1-70b-versatile',
    // Key read from VITE_GROQ_API_KEY
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelayMs: 2000, // 2 seconds between retries, doubles each time
  }
};
