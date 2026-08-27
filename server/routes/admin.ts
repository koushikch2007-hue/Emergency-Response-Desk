import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { inMemoryAuditLogs } from './incidents.js';

const router = Router();

const SYSTEM_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'reporter@emergency.gov',
    full_name: 'Jane Citizen',
    role: 'reporter',
    department: null,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dispatcher@emergency.gov',
    full_name: 'Captain Marcus Vance',
    role: 'authority',
    department: 'Fire & Emergency Services',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@emergency.gov',
    full_name: 'System Admin',
    role: 'admin',
    department: 'Central Command',
    is_active: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/admin/users - User management list
router.get('/users', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({ users: SYSTEM_USERS });
  } catch (err) {
    next(err);
  }
});

const UpdateUserRoleSchema = z.object({
  role: z.enum(['reporter', 'authority', 'admin']),
  department: z.string().optional(),
  is_active: z.boolean().optional(),
});

// PATCH /api/admin/users/:id/role - Update User Role / Dept
router.patch('/users/:id/role', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = SYSTEM_USERS.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validated = UpdateUserRoleSchema.parse(req.body);
    const oldRole = user.role;

    user.role = validated.role;
    if (validated.department !== undefined) user.department = validated.department;
    if (validated.is_active !== undefined) user.is_active = validated.is_active;

    // Record audit event
    inMemoryAuditLogs.push({
      id: crypto.randomUUID(),
      actor_id: req.user!.id,
      actor_role: req.user!.role,
      action: 'USER_ROLE_UPDATED',
      target_entity: 'profiles',
      target_id: id,
      metadata: { targetUser: user.email, oldRole, newRole: validated.role, department: validated.department },
      created_at: new Date().toISOString(),
    });

    return res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-log - System Audit Log
router.get('/audit-log', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, actor_role, search } = req.query;
    let logs = [...inMemoryAuditLogs];

    if (logs.length === 0) {
      // Seed sample audit log items
      logs = [
        {
          id: 'log-1',
          actor_id: '33333333-3333-3333-3333-333333333333',
          actor_role: 'admin',
          action: 'USER_ROLE_UPDATED',
          target_entity: 'profiles',
          target_id: '22222222-2222-2222-2222-222222222222',
          metadata: { targetUser: 'dispatcher@emergency.gov', newRole: 'authority' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'log-2',
          actor_id: '11111111-1111-1111-1111-111111111111',
          actor_role: 'reporter',
          action: 'INCIDENT_CREATED',
          target_entity: 'incidents',
          target_id: 'a1b2c3d4-0001-4000-8000-000000000001',
          metadata: { reference_code: 'INC-20260827-8912', priority: 'critical' },
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ];
    }

    if (action && typeof action === 'string') {
      logs = logs.filter((l) => l.action === action);
    }
    if (actor_role && typeof actor_role === 'string') {
      logs = logs.filter((l) => l.actor_role === actor_role);
    }

    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.json({ logs });
  } catch (err) {
    next(err);
  }
});

export default router;
