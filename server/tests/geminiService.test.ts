import { describe, it, expect } from 'vitest';
import { GeminiAnalysisSchema, analyzeIncidentWithGemini } from '../services/geminiService.js';

describe('Gemini AI Triage Service', () => {
  it('validates AI triage JSON schema with Zod', () => {
    const validAiPayload = {
      ai_category: 'fire',
      ai_urgency: 'critical',
      ai_summary: 'Active commercial building fire reported with smoke hazard.',
      ai_hazards: ['Toxic smoke inhalation', 'Structural failure'],
      ai_departments: ['Fire & Rescue Dept', 'Police Dept'],
      ai_duplicate_signals: ['Commercial fire main street'],
      ai_clarifying_questions: ['Are occupants evacuated?'],
    };

    const parsed = GeminiAnalysisSchema.parse(validAiPayload);
    expect(parsed.ai_category).toBe('fire');
    expect(parsed.ai_urgency).toBe('critical');
    expect(parsed.ai_hazards.length).toBe(2);
  });

  it('returns null fallback gracefully when API key is missing or unconfigured', async () => {
    const result = await analyzeIncidentWithGemini({
      title: 'Gas leak smell outside store',
      description: 'Strong gas odor detected near kitchen exhaust.',
      category: 'hazardous_material',
      user_severity: 'high',
      is_injured: false,
      is_trapped: false,
      is_life_threatening: true,
      is_active: true,
      involves_vulnerable_people: false,
      people_affected: 5,
    });

    // Should return null and not throw error
    expect(result).toBeNull();
  });
});
