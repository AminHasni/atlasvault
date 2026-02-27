import { GoogleGenAI } from "@google/genai";
import { ServiceCategory, ServiceItem, Category } from "../types";

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

export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  context: { services: ServiceItem[]; categories: Category[] }
) => {
  if (!ai) {
    throw new Error("AI Client not initialized");
  }

  // Build system context from catalog
  const catalogContext = context.services.map(s => {
    const subPath = [s.category, s.subcategory, s.second_subcategory_id].filter(Boolean).join(' > ');
    return `- ${s.name} (${subPath}): ${s.price} ${s.currency}. Desc: ${s.description}. Active: ${s.active}`;
  }).join('\n');

  const categoriesContext = context.categories.map(c => {
    let text = `- ${c.label} (${c.id}): ${c.desc}`;
    if (c.subcategories) {
      c.subcategories.forEach(sub => {
        text += `\n  - Sub: ${sub.label} (${sub.id})`;
        if (sub.second_subcategories) {
          sub.second_subcategories.forEach(ss => {
            text += `\n    - L2: ${ss.label} (${ss.id})`;
          });
        }
      });
    }
    return text;
  }).join('\n');

  const systemInstruction = `You are ATLAS, the elite AI concierge for ATLASVAULT.
  
  Your goal is to assist users in navigating our premium digital service catalog.
  
  Organization:
  We have these categories:
  ${categoriesContext}

  Current Catalog Items:
  ${catalogContext}

  Guidelines:
  1. Be professional, concise, and helpful. Tone: Cyberpunk-Luxury, Premium, Secure.
  2. If a user asks for a recommendation, ask specifically what they need (gaming, security, connectivity) if not clear.
  3. Prices are in TND (Tunisian Dinar).
  4. If asked about "how to order", explain they can click the service card and choose "Order via WhatsApp".
  5. Do not hallucinate services that are not in the list above.
  6. Keep responses relatively short (under 100 words) unless detailed explanation is requested.
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    },
    history: history,
  });

  return await chat.sendMessageStream({ message });
};

export const generateMarketingVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  // 1. Handle API Key Selection for Veo
  // Using explicit casting to avoid TypeScript errors with existing global declarations
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
      // Assume success and proceed, or user cancelled and error will occur below
    }
  }

  // Create a fresh instance with the (potentially newly selected) API Key
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await genAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio,
      }
    });

    // Polling mechanism
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await genAI.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("Video generation completed but no URI was returned.");
    }

    return videoUri;
  } catch (error) {
    console.error("Veo API Error:", error);
    throw new Error("Failed to generate video. Ensure you have selected a valid paid API key.");
  }
};

export const fetchVideoBlob = async (videoUri: string): Promise<string> => {
  try {
    // Append API key to the URI as required by Veo docs
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching video blob:", error);
    return '';
  }
};