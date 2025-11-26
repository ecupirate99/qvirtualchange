
import { GoogleGenAI, Type } from "@google/genai";
import { FileData, StyleSuggestion } from "../types";

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

const getAiClient = () => {
  // Prefer process.env.API_KEY as per guidelines, but fall back to a global for client-side deployments
  const apiKey = process.env.API_KEY || (window as any).GEMINI_API_KEY; 
  if (!apiKey || apiKey === "VDR_API_KEY_PLACEHOLDER") { // Check for the placeholder too
    throw new Error(
      "API Key is missing or incorrectly configured. For client-side deployments (like Netlify), " +
      "please ensure your API key is set as a global variable. If using Netlify, " +
      "set `GEMINI_API_KEY` in environment variables and configure the build command " +
      "to replace the placeholder in `index.html`. Refer to documentation for details."
    );
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTryOn = async (
  person: FileData,
  clothing: FileData
): Promise<string> => {
  const ai = getAiClient();

  // Order matters: Person first, then clothing, then instruction
  const parts = [
    {
      inlineData: {
        mimeType: person.mimeType,
        data: person.base64,
      },
    },
    {
      inlineData: {
        mimeType: clothing.mimeType,
        data: clothing.base64,
      },
    },
    {
      text: `Perform a virtual try-on. 
      The first image is the target PERSON. 
      The second image is the CLOTHING item (garment).
      
      Task: Generate a high-quality, photorealistic image of the PERSON wearing the CLOTHING.
      
      CRITICAL INSTRUCTIONS:
      1. COMPLETELY REPLACE the person's original outfit.
      2. If the new clothing has shorter sleeves or reveals more skin than the original outfit (e.g. short sleeve shirt vs long sleeve shirt), you MUST GENERATE REALISTIC SKIN for the exposed areas.
      3. DO NOT leave the original long sleeves or clothing visible underneath the new garment.
      4. Retain the person's exact facial features, body pose, skin tone, and the background.
      5. Ensure the clothing fits naturally, respecting the body's perspective and lighting.
      6. Output ONLY the resulting image.`
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: { parts },
    });

    // Check for image in the response parts
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
            // Standardize output to a usable data URL
            return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getStyleSuggestions = async (person: FileData): Promise<StyleSuggestion[]> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: person.mimeType,
              data: person.base64
            }
          },
          {
            text: "Analyze this person's style, body type, and the context of the photo. Suggest 3 distinct, fashionable clothing items (tops/dresses/outwear) that would look amazing on them. Be specific about materials and cuts."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "Short catchy name of the item" },
              description: { type: Type.STRING, description: "Detailed visual description of the garment for an image generator" },
              color: { type: Type.STRING },
              reasoning: { type: Type.STRING, description: "Why this fits the user" }
            },
            required: ["title", "description", "color", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Add IDs if missing
    const suggestions: StyleSuggestion[] = JSON.parse(text);
    return suggestions.map((s, i) => ({ ...s, id: s.id || `suggestion-${i}` }));

  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const generateClothingPreview = async (suggestion: StyleSuggestion): Promise<FileData> => {
  return generateClothingFromPrompt(`${suggestion.color} ${suggestion.title}. ${suggestion.description}`);
};

export const generateClothingFromPrompt = async (userPrompt: string): Promise<FileData> => {
  const ai = getAiClient();

  const prompt = `Generate a high-quality, professional product photography image of the following clothing item: ${userPrompt}.
  View: Front view, flat lay or on a mannequin ghost.
  Background: Pure white or clean neutral background.
  Style: Photorealistic, high detail fashion e-commerce style.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
            const base64 = part.inlineData.data;
            const previewUrl = `data:image/png;base64,${base64}`;
            
            // Create a pseudo-file for internal consistency
            const file = new File([new Blob([''], {type: 'image/png'})], `generated-clothing.png`, { type: 'image/png' });

            return {
              file,
              previewUrl,
              base64,
              mimeType: 'image/png'
            };
        }
      }
    }
    throw new Error("Failed to generate clothing asset");
  } catch (error) {
    console.error("Error generating clothing:", error);
    throw error;
  }
};