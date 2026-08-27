import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config, logger } from '../config.js';
import { IncidentCategory, PriorityLevel } from './priorityEngine.js';

export const GeminiAnalysisSchema = z.object({
  ai_category: z.enum([
    'accident',
    'fire',
    'medical',
    'crime',
    'flood_weather',
    'utility',
    'hazardous_material',
    'infrastructure',
    'public_safety',
    'other',
  ]),
  ai_urgency: z.enum(['low', 'medium', 'high', 'critical']),
  ai_summary: z.string().max(1000),
  ai_hazards: z.array(z.string()).default([]),
  ai_departments: z.array(z.string()).default([]),
  ai_duplicate_signals: z.array(z.string()).default([]),
  ai_clarifying_questions: z.array(z.string()).default([]),
});

export type GeminiAnalysisResult = z.infer<typeof GeminiAnalysisSchema>;

export interface IncidentDetailsForAI {
  title: string;
  description: string;
  category: IncidentCategory;
  user_severity: PriorityLevel;
  is_injured: boolean;
  is_trapped: boolean;
  is_life_threatening: boolean;
  is_active: boolean;
  involves_vulnerable_people: boolean;
  people_affected: number;
  location_description?: string;
  address?: string;
}

export async function analyzeIncidentWithGemini(
  incident: IncidentDetailsForAI,
  timeoutMs: number = 5000
): Promise<GeminiAnalysisResult | null> {
  if (!config.geminiApiKey) {
    logger.info('GEMINI_API_KEY not configured. Skipping Gemini enrichment and using deterministic fallback.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const prompt = `You are an AI Emergency Triage Assistant for the Emergency Response Desk platform.
Analyze the following user-submitted emergency complaint and provide a structured JSON response.

CRITICAL CONSTRAINTS:
1. Do NOT dispatch emergency services or promise response times.
2. Provide a concise, factual summary (2-3 sentences max).
3. Identify secondary hazards (e.g. electrical wire risk, chemical fumes, traffic blockages).
4. Suggest primary responder departments (e.g. "Fire & Rescue Department", "Emergency Medical Services", "Police Department", "Public Works", "Hazmat Response Unit").
5. Suggest 2-3 recommended clarifying questions for dispatchers/authorities to ask.

INCIDENT DETAILS:
- Title: ${incident.title}
- Description: ${incident.description}
- Category: ${incident.category}
- Self-Reported Severity: ${incident.user_severity}
- Safety Flags: Injured=${incident.is_injured}, Trapped=${incident.is_trapped}, Life Threatening=${incident.is_life_threatening}, Active=${incident.is_active}, Vulnerable People=${incident.involves_vulnerable_people}
- People Affected: ${incident.people_affected}
- Location Description: ${incident.location_description || 'N/A'}
- Address: ${incident.address || 'N/A'}

Respond strictly with valid JSON matching this schema:
{
  "ai_category": "accident" | "fire" | "medical" | "crime" | "flood_weather" | "utility" | "hazardous_material" | "infrastructure" | "public_safety" | "other",
  "ai_urgency": "low" | "medium" | "high" | "critical",
  "ai_summary": "Factual 2-3 sentence summary",
  "ai_hazards": ["hazard 1", "hazard 2"],
  "ai_departments": ["Department 1", "Department 2"],
  "ai_duplicate_signals": ["keywords or signal"],
  "ai_clarifying_questions": ["Question 1", "Question 2"]
}`;

    // Execute with a strict timeout wrapper
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), timeoutMs)
    );

    const callPromise = (async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty text response from Gemini');

      const parsedJson = JSON.parse(text);
      return GeminiAnalysisSchema.parse(parsedJson);
    })();

    const result = (await Promise.race([callPromise, timeoutPromise])) as GeminiAnalysisResult;
    return result;
  } catch (error: any) {
    logger.warn({ err: error.message }, 'Gemini AI triage analysis failed or timed out. Falling back to deterministic rules.');
    return null;
  }
}
