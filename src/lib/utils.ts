import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IncidentCategory, PriorityLevel, IncidentStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;


export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'N/A';
  const seconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const CATEGORY_DETAILS: Record<
  IncidentCategory,
  { label: string; description: string; icon: string; safetyGuidance: string }
> = {
  accident: {
    label: 'Accident',
    description: 'Road, vehicle, workplace, or public accidents',
    icon: 'Car',
    safetyGuidance: 'Stay in a safe area away from incoming traffic. Turn on hazard warning lights if applicable.',
  },
  fire: {
    label: 'Fire & Explosion',
    description: 'Active fires, smoke, explosions, or fire hazards',
    icon: 'Flame',
    safetyGuidance: 'Move to a safe location upwind and do not approach or re-enter burning structures.',
  },
  medical: {
    label: 'Medical Emergency',
    description: 'Medical emergencies, severe injuries, unconscious persons, or urgent health incidents',
    icon: 'HeartPulse',
    safetyGuidance: 'Do not put yourself at risk while assisting another person. Stay with the patient if safe.',
  },
  crime: {
    label: 'Crime & Public Threat',
    description: 'Theft, assault, violence, suspicious activity, or public safety threats',
    icon: 'ShieldAlert',
    safetyGuidance: 'Do not confront a dangerous or armed person; move to a safe, well-lit location immediately.',
  },
  flood_weather: {
    label: 'Flood & Weather Hazard',
    description: 'Flooding, severe storms, landslides, extreme weather, or natural hazards',
    icon: 'CloudRain',
    safetyGuidance: 'Move away from fast-moving water, storm drains, and unstable ground or damaged structures.',
  },
  utility: {
    label: 'Utility Failure',
    description: 'Power outages, water main breaks, electrical hazards, or service disruptions',
    icon: 'Zap',
    safetyGuidance: 'Keep clear of downed power lines and standing water near electrical equipment.',
  },
  hazardous_material: {
    label: 'Hazardous Material / Gas Leak',
    description: 'Gas leaks, chemical spills, toxic fumes, or hazardous exposure',
    icon: 'Biohazard',
    safetyGuidance: 'Move away from the area, stay upwind, and avoid using open flames or electrical switches.',
  },
  infrastructure: {
    label: 'Infrastructure Failure',
    description: 'Damaged roads, bridges, buildings, traffic signals, or structural failures',
    icon: 'Building2',
    safetyGuidance: 'Keep a safe distance from damaged structures, sagging bridges, or compromised roadways.',
  },
  public_safety: {
    label: 'Public Safety Threat',
    description: 'Crowd danger, missing persons, unsafe public conditions, or general threats',
    icon: 'AlertTriangle',
    safetyGuidance: 'Alert nearby individuals if safe and maintain situational awareness.',
  },
  other: {
    label: 'Other Urgent Hazard',
    description: 'Incidents not covered by the listed categories',
    icon: 'HelpCircle',
    safetyGuidance: 'Ensure your immediate safety first before observing details.',
  },
};

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; colorClass: string; bgClass: string; borderClass: string; textClass: string; icon: string; ariaLabel: string }
> = {
  critical: {
    label: 'CRITICAL',
    colorClass: 'bg-red-600 text-white',
    bgClass: 'bg-red-950/40',
    borderClass: 'border-red-500/50',
    textClass: 'text-red-400',
    icon: 'Siren',
    ariaLabel: 'Critical Priority - Highest Immediate Urgency',
  },
  high: {
    label: 'HIGH',
    colorClass: 'bg-orange-600 text-white',
    bgClass: 'bg-orange-950/40',
    borderClass: 'border-orange-500/50',
    textClass: 'text-orange-400',
    icon: 'AlertOctagon',
    ariaLabel: 'High Priority - Urgent Attention Required',
  },
  medium: {
    label: 'MEDIUM',
    colorClass: 'bg-amber-600 text-white',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-500/50',
    textClass: 'text-amber-400',
    icon: 'AlertTriangle',
    ariaLabel: 'Medium Priority - Standard Dispatch Queue',
  },
  low: {
    label: 'LOW',
    colorClass: 'bg-blue-600 text-white',
    bgClass: 'bg-blue-950/40',
    borderClass: 'border-blue-500/50',
    textClass: 'text-blue-400',
    icon: 'Info',
    ariaLabel: 'Low Priority - Scheduled Review',
  },
};

export const STATUS_CONFIG: Record<
  IncidentStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  submitted: { label: 'Submitted', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400', borderClass: 'border-amber-500/30' },
  acknowledged: { label: 'Acknowledged', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400', borderClass: 'border-blue-500/30' },
  assigned: { label: 'Assigned', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400', borderClass: 'border-purple-500/30' },
  in_progress: { label: 'In Progress', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-400', borderClass: 'border-indigo-500/30' },
  resolved: { label: 'Resolved', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/30' },
  closed: { label: 'Closed', bgClass: 'bg-slate-500/10', textClass: 'text-slate-400', borderClass: 'border-slate-500/30' },
  rejected: { label: 'Rejected', bgClass: 'bg-rose-500/10', textClass: 'text-rose-400', borderClass: 'border-rose-500/30' },
};
