export type IncidentCategory =
  | 'accident'
  | 'fire'
  | 'medical'
  | 'crime'
  | 'flood_weather'
  | 'utility'
  | 'hazardous_material'
  | 'infrastructure'
  | 'public_safety'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PriorityInput {
  category: IncidentCategory;
  user_severity: SeverityLevel;
  is_injured: boolean;
  is_trapped: boolean;
  is_life_threatening: boolean;
  is_active: boolean;
  involves_vulnerable_people: boolean;
  people_affected: number;
}

export interface TriggeredRule {
  rule: string;
  score: number;
  description: string;
}

export interface PriorityResult {
  priority_score: number;
  deterministic_priority: PriorityLevel;
  triggered_rules: TriggeredRule[];
  minimum_overrides: string[];
}

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function comparePriority(p1: PriorityLevel, p2: PriorityLevel): number {
  return PRIORITY_ORDER[p1] - PRIORITY_ORDER[p2];
}

export function maxPriority(p1: PriorityLevel, p2?: PriorityLevel | null): PriorityLevel {
  if (!p2) return p1;
  return PRIORITY_ORDER[p1] >= PRIORITY_ORDER[p2] ? p1 : p2;
}

export function calculateDeterministicPriority(input: PriorityInput): PriorityResult {
  let score = 0;
  const triggered_rules: TriggeredRule[] = [];
  const minimum_overrides: string[] = [];

  // Rule 1: Immediate threat to life
  if (input.is_life_threatening) {
    score += 100;
    triggered_rules.push({
      rule: 'life_threatening',
      score: 100,
      description: 'Immediate threat to life reported',
    });
  }

  // Rule 2: Trapped person
  if (input.is_trapped) {
    score += 90;
    triggered_rules.push({
      rule: 'trapped_person',
      score: 90,
      description: 'Trapped person unable to escape',
    });
  }

  // Rule 3: Active fire
  if (input.category === 'fire' && input.is_active) {
    score += 80;
    triggered_rules.push({
      rule: 'active_fire',
      score: 80,
      description: 'Active fire or explosion hazard',
    });
  }

  // Rule 4: Injury or medical emergency
  if (input.is_injured || input.category === 'medical') {
    score += 70;
    triggered_rules.push({
      rule: 'injury_medical',
      score: 70,
      description: 'Medical emergency or active injury',
    });
  }

  // Rule 5: Hazardous-material exposure or gas leak
  if (input.category === 'hazardous_material') {
    score += 70;
    triggered_rules.push({
      rule: 'hazmat_exposure',
      score: 70,
      description: 'Hazardous material spill or chemical/gas leak',
    });
  }

  // Rule 6: Structural collapse or infrastructure danger
  if (input.category === 'infrastructure') {
    score += 55;
    triggered_rules.push({
      rule: 'infrastructure_danger',
      score: 55,
      description: 'Critical structural or public infrastructure hazard',
    });
  }

  // Rule 7: Vulnerable people involved
  if (input.involves_vulnerable_people) {
    score += 25;
    triggered_rules.push({
      rule: 'vulnerable_people',
      score: 25,
      description: 'Children, elderly, or vulnerable persons involved',
    });
  }

  // Rule 8: Incident currently active
  if (input.is_active) {
    score += 20;
    triggered_rules.push({
      rule: 'active_incident',
      score: 20,
      description: 'Incident is actively ongoing',
    });
  }

  // Rule 9: People affected
  if (input.people_affected > 50) {
    score += 30;
    triggered_rules.push({
      rule: 'affected_over_50',
      score: 30,
      description: 'More than 50 people affected (>50)',
    });
  } else if (input.people_affected >= 10 && input.people_affected <= 50) {
    score += 20;
    triggered_rules.push({
      rule: 'affected_10_50',
      score: 20,
      description: 'Between 10 and 50 people affected',
    });
  } else if (input.people_affected >= 2 && input.people_affected <= 9) {
    score += 10;
    triggered_rules.push({
      rule: 'affected_2_9',
      score: 10,
      description: 'Between 2 and 9 people affected',
    });
  }

  // Rule 10: User severity
  if (input.user_severity === 'critical') {
    score += 40;
    triggered_rules.push({
      rule: 'user_severity_critical',
      score: 40,
      description: 'Reporter self-selected Critical severity',
    });
  } else if (input.user_severity === 'high') {
    score += 25;
    triggered_rules.push({
      rule: 'user_severity_high',
      score: 25,
      description: 'Reporter self-selected High severity',
    });
  } else if (input.user_severity === 'medium') {
    score += 10;
    triggered_rules.push({
      rule: 'user_severity_medium',
      score: 10,
      description: 'Reporter self-selected Medium severity',
    });
  }

  // Rule 11: Category bonuses
  if (input.category === 'fire') {
    score += 15;
    triggered_rules.push({
      rule: 'category_fire_bonus',
      score: 15,
      description: 'Fire category bonus',
    });
  } else if (input.category === 'medical') {
    score += 15;
    triggered_rules.push({
      rule: 'category_medical_bonus',
      score: 15,
      description: 'Medical category bonus',
    });
  } else if (input.category === 'hazardous_material') {
    score += 15;
    triggered_rules.push({
      rule: 'category_hazmat_bonus',
      score: 15,
      description: 'Hazardous Material category bonus',
    });
  } else if (input.category === 'crime') {
    score += 10;
    triggered_rules.push({
      rule: 'category_crime_bonus',
      score: 10,
      description: 'Crime / Safety threat category bonus',
    });
  }

  // Score to Base Tier mapping
  let calculated_tier: PriorityLevel = 'low';
  if (score >= 120) {
    calculated_tier = 'critical';
  } else if (score >= 70) {
    calculated_tier = 'high';
  } else if (score >= 30) {
    calculated_tier = 'medium';
  } else {
    calculated_tier = 'low';
  }

  let final_deterministic = calculated_tier;

  // Apply Mandatory Minimum Rules
  if (input.is_life_threatening) {
    final_deterministic = maxPriority(final_deterministic, 'critical');
    minimum_overrides.push('Mandatory Minimum: Life-threatening flag requires CRITICAL priority');
  }

  if (input.is_trapped) {
    final_deterministic = maxPriority(final_deterministic, 'critical');
    minimum_overrides.push('Mandatory Minimum: Trapped person requires CRITICAL priority');
  }

  if (input.category === 'fire' && input.is_active && (input.people_affected >= 1 || input.is_injured || input.is_trapped)) {
    final_deterministic = maxPriority(final_deterministic, 'critical');
    minimum_overrides.push('Mandatory Minimum: Active fire with affected persons requires CRITICAL priority');
  }

  if (input.category === 'hazardous_material' && input.is_active) {
    final_deterministic = maxPriority(final_deterministic, 'critical');
    minimum_overrides.push('Mandatory Minimum: Active hazardous-material exposure requires CRITICAL priority');
  }

  if (input.is_injured && input.is_active) {
    final_deterministic = maxPriority(final_deterministic, 'high');
    minimum_overrides.push('Mandatory Minimum: Active incident with injury requires at least HIGH priority');
  }

  if (input.category === 'infrastructure' && input.is_active && input.people_affected >= 2) {
    final_deterministic = maxPriority(final_deterministic, 'high');
    minimum_overrides.push('Mandatory Minimum: Active infrastructure failure affecting multiple people requires at least HIGH priority');
  }

  if (input.user_severity === 'critical') {
    final_deterministic = maxPriority(final_deterministic, 'critical');
    minimum_overrides.push('Mandatory Minimum: User-selected Critical severity requires CRITICAL priority');
  }

  if (input.user_severity === 'high') {
    final_deterministic = maxPriority(final_deterministic, 'high');
    minimum_overrides.push('Mandatory Minimum: User-selected High severity requires at least HIGH priority');
  }

  return {
    priority_score: score,
    deterministic_priority: final_deterministic,
    triggered_rules,
    minimum_overrides,
  };
}

/**
 * Reconciles deterministic priority with AI urgency recommendation.
 * GEMINI MUST NEVER DOWNGRADE THE PRIORITY established by the deterministic engine.
 */
export function reconcilePriority(
  deterministic_priority: PriorityLevel,
  ai_urgency?: PriorityLevel | null
): { final_priority: PriorityLevel; reason: string } {
  if (!ai_urgency) {
    return {
      final_priority: deterministic_priority,
      reason: 'Final priority determined solely by deterministic safety rules (AI response absent or unavailable)',
    };
  }

  if (comparePriority(ai_urgency, deterministic_priority) > 0) {
    return {
      final_priority: ai_urgency,
      reason: `Priority upgraded from deterministic minimum (${deterministic_priority.toUpperCase()}) to AI recommended (${ai_urgency.toUpperCase()}) based on secondary hazard risk assessment`,
    };
  } else {
    return {
      final_priority: deterministic_priority,
      reason: `Deterministic safety minimum (${deterministic_priority.toUpperCase()}) preserved. Gemini recommendation (${ai_urgency.toUpperCase()}) did not exceed deterministic rule minimum.`,
    };
  }
}
