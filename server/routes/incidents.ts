import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { calculateDeterministicPriority, reconcilePriority, comparePriority, PriorityLevel, IncidentCategory, SeverityLevel } from '../services/priorityEngine.js';
import { analyzeIncidentWithGemini } from '../services/geminiService.ts';
import { uploadIncidentMedia, getSignedMediaUrl } from '../services/storageService.js';
import { createNotification } from '../services/notificationService.js';
import { supabase, logger } from '../config.js';

const router = Router();

// In-Memory Fallback Data Store for standalone offline/demo operation
export const inMemoryIncidents: Map<string, any> = new Map();
export const inMemoryHistory: Map<string, any[]> = new Map();
export const inMemoryComments: Map<string, any[]> = new Map();
export const inMemoryNotifications: Map<string, any[]> = new Map();
export const inMemoryAuditLogs: any[] = [];

// Seed sample incidents into in-memory store for instant demonstration
function seedSampleData() {
  if (inMemoryIncidents.size > 0) return;

  const sample1 = {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    reference_code: 'INC-20260827-8912',
    reporter_id: '11111111-1111-1111-1111-111111111111',
    title: 'Major Multi-Vehicle Collision with Trapped Passengers on Highway 101',
    description: 'A severe three-car collision occurred near Exit 14. One SUV rolled over onto its side. At least two occupants appear trapped inside the vehicle. Smoke is coming from the engine bay. Traffic is completely blocked in both northbound lanes.',
    category: 'accident' as IncidentCategory,
    user_severity: 'critical' as SeverityLevel,
    is_injured: true,
    is_trapped: true,
    is_life_threatening: true,
    is_active: true,
    involves_vulnerable_people: true,
    people_affected: 6,
    location_description: 'Northbound Highway 101 near Exit 14 overpass',
    address: 'Highway 101 Mile Marker 42, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    reporter_name: 'Jane Citizen',
    reporter_phone: '555-0192',
    reporter_email: 'jane@example.com',
    priority_score: 340,
    deterministic_priority: 'critical' as PriorityLevel,
    final_priority: 'critical' as PriorityLevel,
    priority_reasons: [
      { rule: 'life_threatening', score: 100, description: 'Immediate threat to life reported' },
      { rule: 'trapped_person', score: 90, description: 'Trapped person unable to escape' },
      { rule: 'injury_medical', score: 70, description: 'Medical emergency or active injury' },
      { rule: 'user_severity_critical', score: 40, description: 'Reporter self-selected Critical severity' },
    ],
    ai_category: 'accident',
    ai_summary: 'Severe 3-vehicle rollover crash on Hwy 101 northbound with 2 trapped occupants and active engine smoke hazard.',
    ai_hazards: ['Vehicle engine fire risk', 'High-speed highway traffic hazard', 'Fuel leak'],
    ai_departments: ['Fire & Rescue Dept', 'Emergency Medical Services', 'Highway Patrol'],
    ai_duplicate_signals: ['Hwy 101 Exit 14 crash'],
    ai_clarifying_questions: ['Is fuel leaking onto the roadway?', 'Are any trapped victims conscious?'],
    ai_urgency: 'critical',
    status: 'submitted',
    assigned_to: null,
    assigned_department: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    media: [
      {
        id: 'm1',
        storage_path: 'incidents/a1b2c3d4-0001/car1.jpg',
        file_name: 'accident_scene.jpg',
        mime_type: 'image/jpeg',
        file_size_bytes: 2450000,
        signed_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      },
    ],
  };

  const sample2 = {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    reference_code: 'INC-20260827-4401',
    reporter_id: '11111111-1111-1111-1111-111111111111',
    title: 'Strong Natural Gas Leak Smell in Commercial Shopping Plaza',
    description: 'Pungent odor of natural gas detected outside the West end of Oak Ridge Shopping Center near the restaurant kitchen exhaust vents. Hissing sound heard near main gas meter valve. Pedestrians passing by are coughing.',
    category: 'hazardous_material' as IncidentCategory,
    user_severity: 'high' as SeverityLevel,
    is_injured: false,
    is_trapped: false,
    is_life_threatening: true,
    is_active: true,
    involves_vulnerable_people: false,
    people_affected: 25,
    location_description: 'West entrance near Pizza Kitchen, Oak Ridge Plaza',
    address: '450 Oak Ridge Blvd, San Jose, CA',
    latitude: 37.3382,
    longitude: -121.8863,
    reporter_name: 'Anonymous',
    priority_score: 210,
    deterministic_priority: 'critical' as PriorityLevel,
    final_priority: 'critical' as PriorityLevel,
    priority_reasons: [
      { rule: 'life_threatening', score: 100, description: 'Immediate threat to life reported' },
      { rule: 'hazmat_exposure', score: 70, description: 'Hazardous material spill or chemical/gas leak' },
    ],
    ai_category: 'hazardous_material',
    ai_summary: 'Pressurized natural gas line leak outside commercial plaza with auditory hissing and public vapor exposure risk.',
    ai_hazards: ['Explosive gas accumulation', 'Ignition from electrical appliances', 'Toxic vapor inhalation'],
    ai_departments: ['Hazmat Response Unit', 'Gas Utility Emergency Squad', 'Fire Department'],
    ai_duplicate_signals: ['Oak Ridge Plaza gas smell'],
    ai_clarifying_questions: ['Have surrounding buildings been evacuated?'],
    ai_urgency: 'critical',
    status: 'acknowledged',
    assigned_to: '22222222-2222-2222-2222-222222222222',
    assigned_department: 'Hazmat Response Unit',
    acknowledged_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    media: [],
  };

  const sample3 = {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    reference_code: 'INC-20260827-1120',
    reporter_id: '11111111-1111-1111-1111-111111111111',
    title: 'Water Main Break Flooding Residential Intersection',
    description: 'A 12-inch water main ruptured beneath Main St & 4th Ave intersection. Water is gushing onto the roadway, submerging car tires and washing out gravel beneath the asphalt roadbed.',
    category: 'utility' as IncidentCategory,
    user_severity: 'medium' as SeverityLevel,
    is_injured: false,
    is_trapped: false,
    is_life_threatening: false,
    is_active: true,
    involves_vulnerable_people: false,
    people_affected: 15,
    location_description: 'Corner of Main Street and 4th Avenue',
    address: 'Main St & 4th Ave, Oakland, CA',
    latitude: 37.8044,
    longitude: -122.2712,
    priority_score: 60,
    deterministic_priority: 'medium' as PriorityLevel,
    final_priority: 'medium' as PriorityLevel,
    priority_reasons: [
      { rule: 'active_incident', score: 20, description: 'Incident is actively ongoing' },
      { rule: 'affected_10_50', score: 20, description: 'Between 10 and 50 people affected' },
    ],
    ai_category: 'utility',
    ai_summary: 'Water main rupture causing localized street flooding and potential sinkhole formation.',
    ai_hazards: ['Roadbed erosion', 'Sinkhole risk', 'Water service outage'],
    ai_departments: ['Water Utility Emergency Division', 'Public Works'],
    ai_duplicate_signals: [],
    ai_clarifying_questions: [],
    ai_urgency: 'medium',
    status: 'in_progress',
    assigned_to: '22222222-2222-2222-2222-222222222222',
    assigned_department: 'Water Utility Emergency Division',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    media: [],
  };

  inMemoryIncidents.set(sample1.id, sample1);
  inMemoryIncidents.set(sample2.id, sample2);
  inMemoryIncidents.set(sample3.id, sample3);

  inMemoryHistory.set(sample1.id, [
    {
      id: 'h1',
      incident_id: sample1.id,
      previous_status: null,
      new_status: 'submitted',
      actor_type: 'reporter',
      notes: 'Initial emergency report submitted by public reporter',
      created_at: sample1.created_at,
    },
  ]);

  inMemoryHistory.set(sample2.id, [
    {
      id: 'h2',
      incident_id: sample2.id,
      previous_status: null,
      new_status: 'submitted',
      actor_type: 'reporter',
      notes: 'Report submitted',
      created_at: sample2.created_at,
    },
    {
      id: 'h3',
      incident_id: sample2.id,
      previous_status: 'submitted',
      new_status: 'acknowledged',
      actor_type: 'authority',
      notes: 'Incident acknowledged by Dispatcher Marcus Vance',
      created_at: sample2.acknowledged_at,
    },
  ]);
}

seedSampleData();

// Input Validation Schema for Complaint Submission
const CreateIncidentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters')
    .refine((val) => /[a-zA-Z0-9]/.test(val), 'Title must contain at least one alphanumeric character'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category: z.enum([
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
  user_severity: z.enum(['low', 'medium', 'high', 'critical']),
  is_injured: z.boolean().default(false),
  is_trapped: z.boolean().default(false),
  is_life_threatening: z.boolean().default(false),
  is_active: z.boolean().default(true),
  involves_vulnerable_people: z.boolean().default(false),
  people_affected: z.number().int().min(0).max(100000).default(0),
  location_description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reporter_name: z.string().optional(),
  reporter_phone: z.string().optional(),
  reporter_email: z.string().email().optional().or(z.literal('')),
}).refine(
  (data) => {
    return (
      (data.location_description && data.location_description.trim().length > 0) ||
      (data.address && data.address.trim().length > 0) ||
      (typeof data.latitude === 'number' && typeof data.longitude === 'number')
    );
  },
  {
    message: 'At least one location identifier (Location description, Address, or Map Coordinates) must be provided.',
    path: ['location_description'],
  }
);

// POST /api/incidents - Create Emergency Complaint
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateIncidentSchema.parse(req.body);
    const reporterId = req.user!.id;

    // Generate unique reference code (e.g. INC-20260827-9412)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `INC-${dateStr}-${randNum}`;
    const incidentId = crypto.randomUUID();

    // 1. Calculate Deterministic Priority Score & Minimums
    const priorityResult = calculateDeterministicPriority({
      category: validated.category,
      user_severity: validated.user_severity,
      is_injured: validated.is_injured,
      is_trapped: validated.is_trapped,
      is_life_threatening: validated.is_life_threatening,
      is_active: validated.is_active,
      involves_vulnerable_people: validated.involves_vulnerable_people,
      people_affected: validated.people_affected,
    });

    // 2. Run Gemini AI Enrichment (bounded timeout, non-blocking fallback)
    const aiResult = await analyzeIncidentWithGemini({
      title: validated.title,
      description: validated.description,
      category: validated.category,
      user_severity: validated.user_severity,
      is_injured: validated.is_injured,
      is_trapped: validated.is_trapped,
      is_life_threatening: validated.is_life_threatening,
      is_active: validated.is_active,
      involves_vulnerable_people: validated.involves_vulnerable_people,
      people_affected: validated.people_affected,
      location_description: validated.location_description,
      address: validated.address,
    });

    // 3. Reconcile Final Priority (Gemini NEVER downgrades deterministic minimum)
    const priorityReconciliation = reconcilePriority(
      priorityResult.deterministic_priority,
      aiResult?.ai_urgency
    );

    const nowIso = new Date().toISOString();

    const newIncident = {
      id: incidentId,
      reference_code: referenceCode,
      reporter_id: reporterId,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      user_severity: validated.user_severity,
      is_injured: validated.is_injured,
      is_trapped: validated.is_trapped,
      is_life_threatening: validated.is_life_threatening,
      is_active: validated.is_active,
      involves_vulnerable_people: validated.involves_vulnerable_people,
      people_affected: validated.people_affected,
      location_description: validated.location_description || null,
      address: validated.address || null,
      latitude: validated.latitude || null,
      longitude: validated.longitude || null,
      reporter_name: validated.reporter_name || null,
      reporter_phone: validated.reporter_phone || null,
      reporter_email: validated.reporter_email || null,
      priority_score: priorityResult.priority_score,
      deterministic_priority: priorityResult.deterministic_priority,
      final_priority: priorityReconciliation.final_priority,
      priority_reasons: priorityResult.triggered_rules,
      ai_category: aiResult?.ai_category || null,
      ai_summary: aiResult?.ai_summary || null,
      ai_hazards: aiResult?.ai_hazards || [],
      ai_departments: aiResult?.ai_departments || [],
      ai_duplicate_signals: aiResult?.ai_duplicate_signals || [],
      ai_clarifying_questions: aiResult?.ai_clarifying_questions || [],
      ai_urgency: aiResult?.ai_urgency || null,
      status: 'submitted' as const,
      assigned_to: null,
      assigned_department: null,
      created_at: nowIso,
      updated_at: nowIso,
      media: [],
    };

    // Store in-memory
    inMemoryIncidents.set(incidentId, newIncident);

    // Initial status history record
    const historyItem = {
      id: crypto.randomUUID(),
      incident_id: incidentId,
      previous_status: null,
      new_status: 'submitted',
      actor_id: reporterId,
      actor_type: 'reporter',
      notes: 'Initial emergency complaint registered',
      created_at: nowIso,
    };
    inMemoryHistory.set(incidentId, [historyItem]);

    // Create in-app confirmation notification for reporter
    await createNotification({
      userId: reporterId,
      incidentId,
      title: `Emergency Report Received (${referenceCode})`,
      message: `Your emergency complaint "${validated.title}" has been registered with priority ${priorityReconciliation.final_priority.toUpperCase()}. Reference code: ${referenceCode}.`,
      type: 'submission',
    });

    // Record audit log
    inMemoryAuditLogs.push({
      id: crypto.randomUUID(),
      actor_id: reporterId,
      actor_role: req.user!.role,
      action: 'INCIDENT_CREATED',
      target_entity: 'incidents',
      target_id: incidentId,
      metadata: { reference_code: referenceCode, priority: priorityReconciliation.final_priority },
      created_at: nowIso,
    });

    logger.info({ referenceCode, priority: priorityReconciliation.final_priority }, 'Incident submitted successfully');

    return res.status(201).json({
      message: 'Emergency complaint submitted successfully',
      incident: newIncident,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents - Query Incident Queue for Authorities
router.get('/', authenticateToken, requireRole(['authority', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      assignee,
      department,
      has_photos,
      is_injured,
      is_trapped,
      is_life_threatening,
      sort_by = 'priority',
      page = '1',
      limit = '20',
    } = req.query;

    let incidents = Array.from(inMemoryIncidents.values());

    // Filtering
    if (status && status !== 'all') {
      incidents = incidents.filter((i) => i.status === status);
    }
    if (category && category !== 'all') {
      incidents = incidents.filter((i) => i.category === category);
    }
    if (priority && priority !== 'all') {
      incidents = incidents.filter((i) => i.final_priority === priority);
    }
    if (assignee && assignee !== 'all') {
      incidents = incidents.filter((i) => i.assigned_to === assignee);
    }
    if (department && department !== 'all') {
      incidents = incidents.filter((i) => i.assigned_department === department);
    }
    if (is_injured === 'true') {
      incidents = incidents.filter((i) => i.is_injured === true);
    }
    if (is_trapped === 'true') {
      incidents = incidents.filter((i) => i.is_trapped === true);
    }
    if (is_life_threatening === 'true') {
      incidents = incidents.filter((i) => i.is_life_threatening === true);
    }
    if (has_photos === 'true') {
      incidents = incidents.filter((i) => i.media && i.media.length > 0);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      incidents = incidents.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.reference_code.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.location_description && i.location_description.toLowerCase().includes(q))
      );
    }

    // Default queue sorting: Critical > High > Medium > Low; oldest unacknowledged first
    incidents.sort((a, b) => {
      const pDiff = comparePriority(b.final_priority, a.final_priority);
      if (pDiff !== 0) return pDiff;

      // Oldest unacknowledged first
      if (a.status === 'submitted' && b.status !== 'submitted') return -1;
      if (b.status === 'submitted' && a.status !== 'submitted') return 1;

      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const totalCount = incidents.length;
    const paginatedIncidents = incidents.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      incidents: paginatedIncidents,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/my - Reporter's list of own incidents
router.get('/my', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let incidents = Array.from(inMemoryIncidents.values()).filter((i) => i.reporter_id === userId);

    incidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Sanitize contact info & internal fields for reporter view
    const sanitized = incidents.map((i) => ({
      id: i.id,
      reference_code: i.reference_code,
      title: i.title,
      description: i.description,
      category: i.category,
      user_severity: i.user_severity,
      final_priority: i.final_priority,
      status: i.status,
      created_at: i.created_at,
      updated_at: i.updated_at,
      photo_count: i.media ? i.media.length : 0,
      location_description: i.location_description,
    }));

    return res.json({ incidents: sanitized });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/:id - Get Single Incident Detail Page
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const incident = inMemoryIncidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    // Role Ownership check
    if (req.user!.role === 'reporter' && incident.reporter_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own submitted emergency reports' });
    }

    const history = inMemoryHistory.get(id) || [];
    const allComments = inMemoryComments.get(id) || [];

    // Filter internal notes if viewer is a reporter
    const visibleComments =
      req.user!.role === 'reporter' ? allComments.filter((c) => c.visibility === 'public') : allComments;

    return res.json({
      incident,
      history,
      comments: visibleComments,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/incidents/:id/status - Update Incident Status
const UpdateStatusSchema = z.object({
  new_status: z.enum(['submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']),
  assigned_to: z.string().optional(),
  assigned_department: z.string().optional(),
  resolution_summary: z.string().optional(),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

router.patch('/:id/status', authenticateToken, requireRole(['authority', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const incident = inMemoryIncidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const validated = UpdateStatusSchema.parse(req.body);

    if (validated.new_status === 'resolved' && (!validated.resolution_summary || validated.resolution_summary.trim() === '')) {
      return res.status(400).json({ error: 'Resolution summary is mandatory when marking an incident as resolved' });
    }

    if (validated.new_status === 'rejected' && (!validated.rejection_reason || validated.rejection_reason.trim() === '')) {
      return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting an incident' });
    }

    const previousStatus = incident.status;
    const nowIso = new Date().toISOString();

    incident.status = validated.new_status;
    incident.updated_at = nowIso;

    if (validated.assigned_to) incident.assigned_to = validated.assigned_to;
    if (validated.assigned_department) incident.assigned_department = validated.assigned_department;
    if (validated.resolution_summary) incident.resolution_summary = validated.resolution_summary;
    if (validated.rejection_reason) incident.rejection_reason = validated.rejection_reason;

    if (validated.new_status === 'acknowledged' && !incident.acknowledged_at) {
      incident.acknowledged_at = nowIso;
    }
    if (validated.new_status === 'resolved' && !incident.resolved_at) {
      incident.resolved_at = nowIso;
    }
    if (validated.new_status === 'closed' && !incident.closed_at) {
      incident.closed_at = nowIso;
    }

    inMemoryIncidents.set(id, incident);

    // Record immutable status history
    const historyItems = inMemoryHistory.get(id) || [];
    const newHistory = {
      id: crypto.randomUUID(),
      incident_id: id,
      previous_status: previousStatus,
      new_status: validated.new_status,
      actor_id: req.user!.id,
      actor_type: req.user!.role,
      notes: validated.notes || `Status changed from ${previousStatus} to ${validated.new_status}`,
      created_at: nowIso,
    };
    historyItems.push(newHistory);
    inMemoryHistory.set(id, historyItems);

    // If resolved or rejected, add automatic public comment update
    if (validated.new_status === 'resolved' || validated.new_status === 'rejected') {
      const commentItems = inMemoryComments.get(id) || [];
      commentItems.push({
        id: crypto.randomUUID(),
        incident_id: id,
        author_id: req.user!.id,
        author_role: req.user!.role,
        visibility: 'public',
        content: validated.new_status === 'resolved' 
          ? `[RESOLVED]: ${validated.resolution_summary}`
          : `[REJECTED]: ${validated.rejection_reason}`,
        created_at: nowIso,
      });
      inMemoryComments.set(id, commentItems);
    }

    // In-app notification to reporter
    await createNotification({
      userId: incident.reporter_id,
      incidentId: id,
      title: `Status Update: ${incident.reference_code}`,
      message: `Your incident status has been updated to "${validated.new_status.toUpperCase()}".`,
      type: 'status_change',
    });

    return res.json({ message: 'Incident status updated successfully', incident });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/incidents/:id/priority - Override Incident Priority
const PriorityOverrideSchema = z.object({
  new_priority: z.enum(['low', 'medium', 'high', 'critical']),
  reason: z.string().min(5, 'Reason for priority change is required'),
});

router.patch('/:id/priority', authenticateToken, requireRole(['authority', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const incident = inMemoryIncidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { new_priority, reason } = PriorityOverrideSchema.parse(req.body);

    // Rule check: Priority can be decreased only down to deterministic minimum
    if (comparePriority(new_priority, incident.deterministic_priority) < 0) {
      return res.status(400).json({
        error: `Priority cannot be downgraded below the deterministic safety minimum level (${incident.deterministic_priority.toUpperCase()}).`,
      });
    }

    const oldPriority = incident.final_priority;
    incident.final_priority = new_priority;
    incident.updated_at = new Date().toISOString();

    inMemoryIncidents.set(id, incident);

    // Record audit event
    inMemoryAuditLogs.push({
      id: crypto.randomUUID(),
      actor_id: req.user!.id,
      actor_role: req.user!.role,
      action: 'PRIORITY_OVERRIDDEN',
      target_entity: 'incidents',
      target_id: id,
      metadata: { oldPriority, newPriority: new_priority, reason },
      created_at: new Date().toISOString(),
    });

    return res.json({ message: 'Incident priority updated', incident });
  } catch (err) {
    next(err);
  }
});

export default router;
