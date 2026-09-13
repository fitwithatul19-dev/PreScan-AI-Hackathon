import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '../config/ai.config';

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiService] Warning: GEMINI_API_KEY is not set in environment.');
    }
    // Initialize Google GenAI client
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }
  return genAIClient;
}

export async function generateGeminiContent(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}): Promise<string> {
  const ai = getGeminiClient();
  const modelName = params.model || AI_CONFIG.MODEL;

  let attempt = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
          responseSchema: params.responseSchema,
          temperature: params.temperature ?? AI_CONFIG.TEMPERATURE,
          maxOutputTokens: params.maxOutputTokens ?? AI_CONFIG.MAX_OUTPUT_TOKENS,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model.');
      }
      return text;
    } catch (error: any) {
      lastError = error;
      console.warn(`[GeminiService] Attempt ${attempt}/${maxAttempts} failed for model ${modelName}:`, error?.message || error);
      
      const isRetryable = error?.status === 503 || error?.status === 429 || error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('RESOURCE_EXHAUSTED');
      if (isRetryable && attempt < maxAttempts) {
        const backoffMs = attempt * 2500;
        console.log(`[GeminiService] Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      } else {
        break;
      }
    }
  }

  throw lastError || new Error(`Gemini model ${modelName} call failed after ${maxAttempts} attempts.`);
}
