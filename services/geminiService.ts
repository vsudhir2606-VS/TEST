
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyData, AIInsight } from "../types";

export async function analyzeProductionData(data: MonthlyData): Promise<AIInsight> {
  // Create instance right before use to ensure latest API key is used
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure it is configured.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const recordsStr = data.records.map(r => `${r.name}: ${r.value}`).join(', ');
  
  const prompt = `
    Analyze the following production data for the month of ${data.monthName}.
    Data: [${recordsStr}]
    
    Provide an executive summary of performance, identify any obvious trends or outliers, 
    and suggest 3-4 actionable recommendations to improve production or maintain quality.
    Ensure the output is strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short professional summary of the month's performance."
            },
            trendAnalysis: {
              type: Type.STRING,
              description: "Identification of key trends, strengths, or weaknesses in the data."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of actionable improvement suggestions."
            }
          },
          required: ["summary", "trendAnalysis", "recommendations"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AIInsight;
  } catch (error) {
    console.error("Gemini Analysis failed:", error);
    // Return a structured error fallback so the UI can still render
    return {
      summary: "We encountered an issue generating your custom AI analysis. This could be due to API availability or data complexity.",
      trendAnalysis: "Unable to calculate automated trends at this time.",
      recommendations: [
        "Review the raw data table below for manual insights.",
        "Check your internet connection and try refreshing the dashboard.",
        "Ensure the uploaded data contains valid numerical values."
      ]
    };
  }
}
