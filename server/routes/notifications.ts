import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { inMemoryNotifications } from './incidents.js';

const router = Router();

// Sample initial notifications for reporter demo user
function initSampleNotifications(userId: string) {
  if (!inMemoryNotifications.has(userId)) {
    inMemoryNotifications.set(userId, [
      {
        id: 'n1',
        user_id: userId,
        incident_id: 'a1b2c3d4-0001-4000-8000-000000000001',
        title: 'Emergency Report Received (INC-20260827-8912)',
        message: 'Your emergency complaint "Major Multi-Vehicle Collision" has been registered with priority CRITICAL.',
        type: 'submission',
        is_read: false,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'n2',
        user_id: userId,
        incident_id: 'a1b2c3d4-0002-4000-8000-000000000002',
        title: 'Status Update: INC-20260827-4401',
        message: 'Your report has been ACKNOWLEDGED by Hazmat Response Unit.',
        type: 'acknowledgment',
        is_read: true,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ]);
  }
}

// GET /api/notifications - List user's notifications
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    initSampleNotifications(userId);

    const list = inMemoryNotifications.get(userId) || [];
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = list.filter((n) => !n.is_read).length;

    return res.json({ notifications: list, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Mark single as read
router.patch('/:id/read', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const list = inMemoryNotifications.get(userId) || [];

    const item = list.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
    }

    inMemoryNotifications.set(userId, list);

    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const list = inMemoryNotifications.get(userId) || [];

    list.forEach((n) => (n.is_read = true));
    inMemoryNotifications.set(userId, list);

    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
