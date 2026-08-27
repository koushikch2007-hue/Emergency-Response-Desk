import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config.js';

const router = Router();

// Demo accounts pool for quick evaluation
const DEMO_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'reporter@emergency.gov',
    full_name: 'Jane Citizen (Reporter)',
    role: 'reporter',
    department: null,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dispatcher@emergency.gov',
    full_name: 'Captain Marcus Vance (Authority)',
    role: 'authority',
    department: 'Fire & Emergency Services',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@emergency.gov',
    full_name: 'System Admin (Admin)',
    role: 'admin',
    department: 'Central Command',
  },
];

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  return res.json({ user: req.user });
});

router.get('/demo-accounts', (req: Request, res: Response) => {
  return res.json({ accounts: DEMO_USERS });
});

export default router;
