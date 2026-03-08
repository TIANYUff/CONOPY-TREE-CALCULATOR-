
import { GoogleGenAI, Type } from "@google/genai";
import { TreeItem, SoilEntry } from "../types";

export interface TreeRecommendation {
  botanicalName: string;
  commonName: string;
  matureDiameterRange: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export const getAIPlanningInsights = async (
  siteArea: number,
  targetPct: number,
  trees: TreeItem[],
  soilEntries: SoilEntry[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As an Urban Landscape Architect, analyze this site:
    Total Site Area: ${siteArea} m2
    Target Canopy Percentage: ${targetPct}%
    Current Trees: ${JSON.stringify(trees)}
    Soil Provisions: ${JSON.stringify(soilEntries)}

    Provide a concise professional summary and 3-4 actionable recommendations to improve canopy health or meet urban planning targets.
  `;

  // Fix: Using gemini-3-pro-preview for complex reasoning tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getTreeRecommendationsByCriteria = async (postcode: string, minDiameter: number): Promise<{ recommendations: TreeRecommendation[], sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Using information from 'Which Plant Where' (whichplantwhere.com.au), search for 3 tree species suitable for urban planting in Australia postcode ${postcode}.
    Each tree must have a mature canopy spread of at least ${minDiameter}m.
    Return the data in a JSON array. 
    Include: botanicalName, commonName, matureDiameterRange (e.g. "5-8m"), and a brief description.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  // Extract JSON from text response safely; search grounding output text might not be pure JSON.
  const text = response.text || "";
  const jsonStart = text.indexOf('[');
  const jsonEnd = text.lastIndexOf(']') + 1;
  
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    const jsonStr = text.substring(jsonStart, jsonEnd);
    try {
      return { recommendations: JSON.parse(jsonStr), sources };
    } catch (e) {
      console.error("JSON Parse Error", e);
    }
  }
  
  return { recommendations: [], sources };
};

export const generateTreeImage = async (treeName: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A photorealistic render of a mature ${treeName} tree in an urban garden, high quality architectural visualization.` }]
      }
    });

    // Fix: Iterating through parts to find the image part instead of assuming first part is image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
  } catch (e) {
    console.error("Image Gen Error", e);
  }
  return null;
};
