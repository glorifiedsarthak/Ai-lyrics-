
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorParams, SongLyrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SONG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative title for the song" },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            description: "Section type: Intro, Verse, Chorus, Bridge, or Outro" 
          },
          lines: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["type", "lines"]
      }
    }
  },
  required: ["title", "sections"]
};

export const generateLyrics = async (params: GeneratorParams): Promise<SongLyrics> => {
  const { topic, genre, mood, keywords } = params;
  
  const prompt = `Write a professionally structured song in the ${genre} genre with a ${mood} mood.
    The song should be about: ${topic}.
    Incorporate these keywords naturally: ${keywords.join(', ')}.
    The output must follow a classic song structure (e.g., Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro).
    Ensure the rhymes are clever and the rhythm fits the genre.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a multi-platinum award-winning songwriter known for poetic depth and catchy hooks. You write lyrics that resonate deeply with listeners.",
        responseMimeType: "application/json",
        responseSchema: SONG_SCHEMA,
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    
    return JSON.parse(jsonStr) as SongLyrics;
  } catch (error) {
    console.error("Error generating lyrics:", error);
    throw error;
  }
};
