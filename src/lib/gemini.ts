import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

/**
 * Returns a lazily initialized Gemini SDK client.
 * This guarantees the server won't crash on startup if the API key is not yet configured.
 */
export function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}
