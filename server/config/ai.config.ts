export const AI_CONFIG = {
  MODEL: process.env.AI_MODEL || 'gemini-3.6-flash',
  FALLBACK_MODELS: ['gemini-3.6-flash'],
  TEMPERATURE: 0.2, // Low randomness for reproducible, deterministic analysis
  MAX_OUTPUT_TOKENS: 8192,
  TIMEOUT_MS: 90000,
  PRESCAN_VERSION: '1.0',
  PROMPT_VERSION: 'v1.0',
};
