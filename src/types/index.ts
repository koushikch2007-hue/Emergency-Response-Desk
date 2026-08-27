export type UserRole = 'reporter' | 'authority' | 'admin';

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

export type IncidentStatus =
  | 'submitted'
  | 'acknowledged'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type ActorType = 'reporter' | 'authority' | 'admin' | 'system' | 'ai';
export type CommentVisibility = 'public' | 'internal';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
}

export interface TriggeredRule {
  rule: string;
  score: number;
  description: string;
}

export interface IncidentMedia {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  signed_url?: string;
}

export interface IncidentHistoryItem {
  id: string;
  incident_id: string;
  previous_status?: IncidentStatus | null;
  new_status: IncidentStatus;
  actor_id?: string;
  actor_type: ActorType;
  notes?: string;
  created_at: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  author_id: string;
  author_name?: string;
  author_role: UserRole;
  visibility: CommentVisibility;
  content: string;
  created_at: string;
}

export interface Incident {
  id: string;
  reference_code: string;
  reporter_id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  user_severity: SeverityLevel;
  is_injured: boolean;
  is_trapped: boolean;
  is_life_threatening: boolean;
  is_active: boolean;
  involves_vulnerable_people: boolean;
  people_affected: number;
  location_description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  reporter_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  priority_score: number;
  deterministic_priority: PriorityLevel;
  final_priority: PriorityLevel;
  priority_reasons: TriggeredRule[];
  ai_category?: IncidentCategory;
  ai_summary?: string;
  ai_hazards?: string[];
  ai_departments?: string[];
  ai_duplicate_signals?: string[];
  ai_clarifying_questions?: string[];
  ai_urgency?: PriorityLevel;
  status: IncidentStatus;
  assigned_to?: string | null;
  assigned_department?: string | null;
  resolution_summary?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  media?: IncidentMedia[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  incident_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  actor_role?: UserRole;
  action: string;
  target_entity: string;
  target_id?: string;
  metadata?: any;
  created_at: string;
}
