
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initialize GoogleGenAI using the process.env.API_KEY string directly as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGalleryMood = async (themeName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give me a short, poetic, 2-sentence description for a photo gallery theme titled "${themeName}".`,
    config: {
      temperature: 0.8,
      topP: 0.9,
    },
  });
  // Fix: Use the .text property directly.
  return response.text || "A beautiful collection of visual moments.";
};

export const analyzePhotoMood = async (photoTitle: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the mood of a photograph titled "${photoTitle}". Provide a 1-word mood and a short 10-word caption.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING },
          caption: { type: Type.STRING }
        },
        required: ["mood", "caption"]
      }
    }
  });
  try {
    // Fix: Access .text property directly and handle potential undefined before parsing.
    const text = response.text;
    return text ? JSON.parse(text) : { mood: "Serene", caption: "A quiet moment captured in time." };
  } catch (e) {
    return { mood: "Serene", caption: "A quiet moment captured in time." };
  }
};
