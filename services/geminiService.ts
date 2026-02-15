import { GoogleGenAI } from "@google/genai";
import { ServiceCategory } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client only if key is present to avoid immediate errors on load if missing
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateServiceDescription = async (
  name: string,
  category: ServiceCategory,
  notes: string
): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Please configure the environment variable.");
  }

  const prompt = `
    You are an expert copywriter for a premium digital service catalog.
    
    Task: Write a compelling, concise, and professional description (max 2 sentences) for a service.
    
    Service Name: ${name}
    Category: ${category}
    Additional Notes/Keywords: ${notes}
    
    The tone should be sophisticated and persuasive. Do not include quotes around the output.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "Description generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate description via AI.");
  }
};
