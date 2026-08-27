import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

const TEAM_MEMBERS = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Captain Marcus Vance',
    email: 'dispatcher@emergency.gov',
    role: 'authority',
    department: 'Fire & Emergency Services',
    is_active: true,
    active_incidents_assigned: 2,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Officer Sarah Chen',
    email: 'sarah.chen@police.gov',
    role: 'authority',
    department: 'Police Department',
    is_active: true,
    active_incidents_assigned: 1,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Dr. Robert Miller',
    email: 'robert.m@ems.gov',
    role: 'authority',
    department: 'Emergency Medical Services',
    is_active: true,
    active_incidents_assigned: 0,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    full_name: 'Elena Rostova',
    email: 'elena@hazmat.gov',
    role: 'authority',
    department: 'Hazmat Response Unit',
    is_active: true,
    active_incidents_assigned: 1,
  },
];

const DEPARTMENTS = [
  'Fire & Emergency Services',
  'Police Department',
  'Emergency Medical Services',
  'Hazmat Response Unit',
  'Public Works',
  'Water Utility Emergency Division',
  'Traffic & Infrastructure Management',
];

router.get('/', authenticateToken, requireRole(['authority', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({ team: TEAM_MEMBERS, departments: DEPARTMENTS });
  } catch (err) {
    next(err);
  }
});

export default router;
