
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export const isGeminiConfigured = Boolean(
    apiKey &&
    apiKey !== "YOUR_GEMINI_API_KEY"
);

if (!isGeminiConfigured) {
    console.warn("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.");
}

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
    if (!isGeminiConfigured || !apiKey) {
        throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
    }

    if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey });
    }

    return aiClient;
};

const complanSchema = {
    type: Type.OBJECT,
    properties: {
        situation: { type: Type.STRING, description: "Detailed description of the current situation and background." },
        objectives: { type: Type.STRING, description: "SMART communication objectives." },
        audiences: { type: Type.STRING, description: "Primary and secondary target audiences." },
        key_messages: { type: Type.STRING, description: "Key messages for each audience." },
        tactics_channels: { type: Type.STRING, description: "Specific tactics and communication channels." },
        timeline: { type: Type.STRING, description: "High-level timeline or sequence of events." },
        resources: { type: Type.STRING, description: "Required resources (personnel, budget, equipment)." },
        coordination: { type: Type.STRING, description: "Internal and external coordination requirements." },
        risks_mitigation: { type: Type.STRING, description: "Potential risks and mitigation strategies." },
        metrics_evaluation: { type: Type.STRING, description: "KPIs and methods for measuring effectiveness." },
    },
    required: [
        "situation", "objectives", "audiences", "key_messages", "tactics_channels", 
        "timeline", "resources", "coordination", "risks_mitigation", "metrics_evaluation"
    ]
};

export const generateComplan = async (inputs: any): Promise<any> => {
    const ai = getClient();
    const prompt = `
        You are an expert military Public Affairs Officer (PAO) specializing in the U.S. Army Corps of Engineers (USACE) strategic communication planning process.
        Your task is to generate a comprehensive 10-step communication plan (COMPLAN) based on the provided inputs. The output must be a well-structured JSON object.

        The 10 steps are:
        1.  Situation: Briefly describe the current situation, background, and why this plan is necessary.
        2.  Objectives: List the specific, measurable, achievable, relevant, and time-bound (SMART) communication objectives.
        3.  Audiences: Identify and describe the primary and secondary target audiences.
        4.  Key Messages: Develop clear and concise key messages for each audience.
        5.  Tactics & Channels: Detail the specific tactics and communication channels to be used to reach the audiences with the key messages.
        6.  Timeline: Provide a high-level timeline or sequence of events for the campaign.
        7.  Resources: Outline the required resources (personnel, budget, equipment).
        8.  Coordination: Describe internal and external coordination requirements.
        9.  Risks & Mitigation: Identify potential risks or challenges and suggest mitigation strategies.
        10. Metrics & Evaluation: Define the Key Performance Indicators (KPIs) and methods for measuring the plan's effectiveness.

        Use the following inputs to generate the plan:
        - Campaign Name: ${inputs.campaignName}
        - Objectives: ${inputs.objectives.join(', ')}
        - Audiences: ${inputs.audiences.join(', ')}
        - Key Messages: ${inputs.key_messages.join(', ')}
        - Channels: ${inputs.channels.join(', ')}
        - Timeline: ${inputs.timeline}
        - Constraints: ${inputs.constraints}
        - KPI Targets: ${inputs.kpi_targets.join(', ')}
        
        Generate a JSON object that strictly follows the provided schema for the 10 sections. Each section should be a string containing well-formatted text, using markdown for lists or emphasis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: complanSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating COMPLAN with Gemini:", error);
        throw new Error("Failed to generate communication plan. Please check your inputs and API key.");
    }
};
