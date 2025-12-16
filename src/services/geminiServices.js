// geminiServices.js
import { GoogleGenAI, Type } from "@google/genai";
import { GoalStatus } from "../types";

// Lazy initialization to avoid crashes at import time
const getAi = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

const geminiServices = {
  /**
   * Refines a rough goal description into a structured SMART goal.
   */
  async refineToSmart(description, horizon) {
    if (!process.env.API_KEY) throw new Error("API Key not found");
    const ai = getAi();

    const prompt = `Convert the following ${horizon} goal into a rigorous SMART goal.
User Input: "${description}"

Ensure the response is realistic and highly strategic.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            smart: {
              type: Type.OBJECT,
              properties: {
                specific: { type: Type.STRING },
                measurable: { type: Type.STRING },
                achievable: { type: Type.STRING },
                relevant: { type: Type.STRING },
                timeBound: { type: Type.STRING }
              },
              required: ["specific", "measurable", "achievable", "relevant", "timeBound"]
            }
          },
          required: ["title", "description", "smart"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text);
  },

  /**
   * Generates a full strategic plan (Annual → Monthly → Weekly → Daily).
   */
  async generateStrategicPlan(vision, category) {
    if (!process.env.API_KEY) throw new Error("API Key not found");
    const ai = getAi();

    const prompt = `Create a complete strategic life plan based on this user vision: "${vision}" in the category "${category}".

Return a single JSON object containing:
1. One annual SMART goal
2. 3 monthly milestones
3. 2 weekly tasks
4. 3 daily tasks`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            annual: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                smart: {
                  type: Type.OBJECT,
                  properties: {
                    specific: { type: Type.STRING },
                    measurable: { type: Type.STRING },
                    achievable: { type: Type.STRING },
                    relevant: { type: Type.STRING },
                    timeBound: { type: Type.STRING }
                  },
                  required: ["specific", "measurable", "achievable", "relevant", "timeBound"]
                }
              },
              required: ["title", "description", "smart"]
            },
            monthly: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] }},
            weekly:  { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] }},
            daily:   { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] }}
          },
          required: ["annual", "monthly", "weekly", "daily"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text);
  },

  /**
   * Breaks a parent goal into actionable sub-goals.
   */
  async breakdownGoal(parentGoal) {
    if (!process.env.API_KEY) throw new Error("API Key not found");
    const ai = getAi();

    let childHorizon, count;
    switch (parentGoal.horizon) {
      case "annual": childHorizon = "monthly"; count = 4; break;
      case "monthly": childHorizon = "weekly"; count = 4; break;
      case "weekly": childHorizon = "daily"; count = 5; break;
      default: return [];
    }

    const prompt = `Break down the following ${parentGoal.horizon} goal into ${count} ${childHorizon} sub-goals.
Parent Goal: "${parentGoal.title}"
SMART Details: ${JSON.stringify(parentGoal.smartCriteria)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              dueDateOffset: { type: Type.NUMBER }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");

    return JSON.parse(response.text).map(item => ({
      title: item.title,
      description: item.description,
      horizon: childHorizon,
      status: GoalStatus.NOT_STARTED,
      progress: 0,
      dueDateOffset: item.dueDateOffset,
      smartCriteria: {
        specific: item.description,
        measurable: "To be defined",
        achievable: "To be defined",
        relevant: `Supports ${parentGoal.title}`,
        timeBound: "To be scheduled"
      }
    }));
  },

  /**
   * Returns concise strategic advice or motivation.
   */
  async getAdvice(goals) {
    if (!process.env.API_KEY) {
      return "API Key missing. Add it to environment variables to enable AI advice.";
    }

    const ai = getAi();
    const activeGoals = goals
      .filter(g => g.status === GoalStatus.IN_PROGRESS)
      .map(g => `${g.horizon}: ${g.title}`);

    const prompt = `You are a world-class strategic life coach.
Active goals:
${activeGoals.join("\n")}

Give concise advice (max 3 sentences).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || "Stay focused and execute the next small win.";
  }
};

export default geminiServices;
