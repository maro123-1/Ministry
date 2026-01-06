
import { GoogleGenAI, Type } from "@google/genai";

// Assume process.env.API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findAvailableUsernames(keyword: string): Promise<string[]> {
  const prompt = `
    You are an expert in creating catchy and available social media usernames.
    Based on the keyword "${keyword}", generate 20 creative and available-sounding usernames.
    The usernames must be between 3 and 7 characters long.
    The usernames can contain letters, numbers, and underscores.
    Return the result as a JSON object with a single key "usernames" which is an array of the suggested username strings.
    Do not return any usernames that are generic or very likely to be taken, like 'test', 'user', 'admin'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usernames: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A suggested available username between 3 and 7 characters."
              }
            }
          }
        },
        temperature: 0.8,
        topP: 0.9,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.usernames)) {
      // Filter again to ensure length constraint is met, as AI can sometimes deviate.
      return result.usernames.filter((u: string) => u.length >= 3 && u.length <= 7);
    }
    return [];

  } catch (error) {
    console.error("Error generating usernames with Gemini:", error);
    throw new Error("Failed to get suggestions from AI. Please check your API key and try again.");
  }
}
