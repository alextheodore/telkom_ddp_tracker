import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTextImprovement = async (
  currentText: string,
  context: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return currentText;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a professional helper for an internship logbook.
      Context: ${context}
      Current Draft: "${currentText}"
      
      Task: Improve, expand, or format the draft to be more professional and detailed. 
      If the draft is empty, provide a structured template based on the context.
      Return only the improved text.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return currentText;
  }
};

export const generateMonthlySummary = async (
  logs: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI services unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following daily logs from an internship, write a professional monthly summary highlighting key activities, learnings, and progress.
      
      Logs:
      ${logs}
      
      Output format: A concise but comprehensive paragraph.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate summary.";
  }
};