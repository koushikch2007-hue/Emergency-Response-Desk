import { describe, it, expect } from 'vitest';
import {
  calculateDeterministicPriority,
  reconcilePriority,
  comparePriority,
  maxPriority,
  PriorityInput,
} from '../services/priorityEngine.js';

describe('Deterministic Priority Engine', () => {
  it('calculates CRITICAL priority for immediate threat to life', () => {
    const input: PriorityInput = {
      category: 'medical',
      user_severity: 'medium',
      is_injured: false,
      is_trapped: false,
      is_life_threatening: true,
      is_active: true,
      involves_vulnerable_people: false,
      people_affected: 1,
    };

    const result = calculateDeterministicPriority(input);
    expect(result.deterministic_priority).toBe('critical');
    expect(result.priority_score).toBeGreaterThanOrEqual(100);
    expect(result.minimum_overrides).toContain('Mandatory Minimum: Life-threatening flag requires CRITICAL priority');
  });

  it('calculates CRITICAL priority for trapped person', () => {
    const input: PriorityInput = {
      category: 'accident',
      user_severity: 'low',
      is_injured: false,
      is_trapped: true,
      is_life_threatening: false,
      is_active: true,
      involves_vulnerable_people: false,
      people_affected: 1,
    };

    const result = calculateDeterministicPriority(input);
    expect(result.deterministic_priority).toBe('critical');
    expect(result.minimum_overrides).toContain('Mandatory Minimum: Trapped person requires CRITICAL priority');
  });

  it('calculates HIGH priority for active injury', () => {
    const input: PriorityInput = {
      category: 'medical',
      user_severity: 'medium',
      is_injured: true,
      is_trapped: false,
      is_life_threatening: false,
      is_active: true,
      involves_vulnerable_people: false,
      people_affected: 1,
    };

    const result = calculateDeterministicPriority(input);
    expect(comparePriority(result.deterministic_priority, 'high')).toBeGreaterThanOrEqual(0);
  });

  it('correctly maps priority levels in order: low < medium < high < critical', () => {
    expect(comparePriority('low', 'medium')).toBeLessThan(0);
    expect(comparePriority('medium', 'high')).toBeLessThan(0);
    expect(comparePriority('high', 'critical')).toBeLessThan(0);
    expect(comparePriority('critical', 'critical')).toBe(0);
  });

  it('reconciles priority and NEVER downgrades deterministic minimum', () => {
    const deterministic = 'critical';
    const aiRecommendation = 'medium'; // AI suggests lower priority

    const reconciled = reconcilePriority(deterministic, aiRecommendation);
    expect(reconciled.final_priority).toBe('critical');
    expect(reconciled.reason.toLowerCase()).toContain('preserved');
  });

  it('upgrades priority if Gemini suggests a higher urgency level', () => {
    const deterministic = 'medium';
    const aiRecommendation = 'high'; // AI suggests higher priority

    const reconciled = reconcilePriority(deterministic, aiRecommendation);
    expect(reconciled.final_priority).toBe('high');
    expect(reconciled.reason).toContain('upgraded');
  });
});
