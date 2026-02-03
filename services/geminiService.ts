
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MeetingType, GoalLabel } from "../types";
import { MEETING_PARTICIPANTS } from "../constants";

// Always initialize GoogleGenAI with process.env.API_KEY as the only parameter in the object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface MeetingSource {
  notes?: string;
  file?: { data: string; mimeType: string; name: string };
}

export async function analyzeMeetingNotes(
  type: MeetingType,
  teamName: string,
  sprintNumber: string,
  sources: MeetingSource[]
): Promise<AnalysisResult> {
  const parts: any[] = [];
  const fileNames: string[] = [];

  sources.forEach((source, index) => {
    if (source.notes) {
      parts.push({ text: `Meeting ${index + 1} Notes:\n${source.notes}` });
    }
    if (source.file) {
      parts.push({
        inlineData: {
          data: source.file.data,
          mimeType: source.file.mimeType,
        },
      });
      fileNames.push(source.file.name);
    }
  });

  const isMulti = sources.length > 1;
  const participantContext = MEETING_PARTICIPANTS.map(p => `- ${p.name}: ${p.role}`).join('\n');

  const prompt = isMulti
    ? `You have been provided with ${sources.length} records for ${type}. Analyze them collectively. 
       Focus on identifying RECURRING patterns, evolving habits, and overall team consistency. 
       Identify if the team is improving or repeating the same mistakes across these sessions.`
    : `Analyze the provided Scrum meeting content for a ${type}. 
       Extract details from the provided text and/or file.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: `You are an expert Agile Coach and Scrum Master. Your task is to analyze meeting records to assess "health".
      
      CRITICAL REFERENCE:
      - Use the **Scrum Guide 2020** as your absolute gold standard for definitions, accountabilities, and event goals.
      - Evaluate team adherence to Scrum Values (Commitment, Focus, Openness, Respect, Courage).
      - Ensure recommendations align with the "Scrum Master as a True Leader" concept from the 2020 guide.

      CONTEXT - KNOWN PARTICIPANTS & ROLES:
      ${participantContext}
      (If any person mentioned in the notes is NOT in this list, assume they are a Developer).

      ANALYSIS GUIDELINES:
      - Use the participant roles to evaluate the quality of contributions. (e.g., Is the Product Owner providing clear direction? Are Architects over-complicating discussions? Is the UIUX team integrated or siloed?)
      - If a specific person is mentioned as having a blocker or making a key decision, mention them by name/role in the evidence or summary if relevant.
      - Identify anti-patterns based on Scrum Guide 2020 deviations (e.g., Daily Scrum used for status reporting rather than planning, lack of a clear Sprint Goal, the Product Owner being absent or not empowered).
      - Tailor recommendations based on roles (e.g., suggesting the Scrum Master facilitates better, or the PM manages stakeholder expectations).

      When multiple meetings are provided:
      1. Provide a high-level aggregate summary.
      2. Score the collective health/consistency.
      3. Identify RECURRING anti-patterns that show up across multiple records.
      4. Provide evidence citing specific meetings and specific participants where applicable.
      5. Provide systemic recommendations.
      6. Look for the team name and the date range covered.

      When a single meeting is provided:
      1. Summarize main points.
      2. Evaluate goal achievement.
      3. Identify anti-patterns with textual evidence.
      4. Provide 3-5 practical recommendations.
      
      Output strictly in JSON format matching the schema provided.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Bullet points summarizing key findings."
          },
          score: {
            type: Type.NUMBER,
            description: "Aggregate health/achievement score 0-100."
          },
          label: {
            type: Type.STRING,
            description: "One of: Achieved, Partially Achieved, Not Achieved."
          },
          antiPatterns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING, description: "Specific citations from the sources, mentioning participants if relevant." }
              },
              required: ["name", "description", "evidence"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["text", "impact"]
            }
          },
          extractedTeamName: {
            type: Type.STRING
          },
          extractedDate: {
            type: Type.STRING,
            description: "A single date or a range like 'Jan 1 - Jan 5'."
          }
        },
        required: ["summary", "score", "label", "antiPatterns", "recommendations"]
      }
    }
  });

  const resultData = JSON.parse(response.text || '{}');

  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    meetingType: type,
    teamName,
    sprintNumber,
    sourceFileNames: fileNames.length > 0 ? fileNames : undefined,
    isMultiMeeting: isMulti,
    ...resultData
  };
}
