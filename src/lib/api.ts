import { Incident, AppNotification, AuditLogItem, UserProfile } from '../types';

const API_BASE = '/api';

function getAuthHeaders(user?: UserProfile | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (user) {
    headers['x-demo-user-id'] = user.id;
    headers['x-demo-role'] = user.role;
  }

  return headers;
}

export async function fetchCurrentProfile(user?: UserProfile | null): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (err) {
    return null;
  }
}

export async function createIncidentReport(payload: any, user?: UserProfile | null): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: getAuthHeaders(user),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to submit incident report');
  }

  return data.incident;
}

export async function fetchIncidentQueue(
  params: Record<string, string>,
  user?: UserProfile | null
): Promise<{ incidents: Incident[]; pagination: any }> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/incidents?${query}`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch incident queue');
  }

  return data;
}

export async function fetchMyReports(user?: UserProfile | null): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents/my`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch personal reports');
  }

  return data.incidents;
}

export async function fetchIncidentDetail(
  id: string,
  user?: UserProfile | null
): Promise<{ incident: Incident; history: any[]; comments: any[] }> {
  const res = await fetch(`${API_BASE}/incidents/${id}`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch incident details');
  }

  return data;
}

export async function updateIncidentStatus(
  id: string,
  payload: any,
  user?: UserProfile | null
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(user),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update incident status');
  }

  return data.incident;
}

export async function overrideIncidentPriority(
  id: string,
  new_priority: string,
  reason: string,
  user?: UserProfile | null
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/priority`, {
    method: 'PATCH',
    headers: getAuthHeaders(user),
    body: JSON.stringify({ new_priority, reason }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to override priority');
  }

  return data.incident;
}

export async function addIncidentComment(
  id: string,
  content: string,
  visibility: 'public' | 'internal' = 'public',
  user?: UserProfile | null
): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${id}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(user),
    body: JSON.stringify({ content, visibility }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add comment');
  }

  return data.comment;
}

export async function fetchNotifications(user?: UserProfile | null): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    return { notifications: [], unreadCount: 0 };
  }

  return data;
}

export async function markNotificationAsRead(id: string, user?: UserProfile | null): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(user),
  });
}

export async function markAllNotificationsAsRead(user?: UserProfile | null): Promise<void> {
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(user),
  });
}

export async function fetchAnalytics(user?: UserProfile | null): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch analytics metrics');
  }

  return data;
}

export async function fetchTeam(user?: UserProfile | null): Promise<{ team: any[]; departments: string[] }> {
  const res = await fetch(`${API_BASE}/team`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    return { team: [], departments: [] };
  }

  return data;
}

export async function fetchAdminUsers(user?: UserProfile | null): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch system users');
  }

  return data.users;
}

export async function updateUserRole(
  id: string,
  payload: { role: string; department?: string; is_active?: boolean },
  user?: UserProfile | null
): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(user),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user role');
  }

  return data.user;
}

export async function fetchAuditLogs(user?: UserProfile | null): Promise<AuditLogItem[]> {
  const res = await fetch(`${API_BASE}/admin/audit-log`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) {
    return [];
  }

  return data.logs;
}
