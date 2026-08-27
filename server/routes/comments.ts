import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { inMemoryIncidents, inMemoryComments } from './incidents.js';
import { createNotification } from '../services/notificationService.js';

const router = Router();

const CreateCommentSchema = z.object({
  content: z.string().trim().min(2, 'Comment cannot be empty').max(2000),
  visibility: z.enum(['public', 'internal']).default('public'),
});

// POST /api/incidents/:id/comments - Add note/comment
router.post('/:id/comments', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const incident = inMemoryIncidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const validated = CreateCommentSchema.parse(req.body);

    // Reporters can only post public follow-up comments on active incidents
    if (req.user!.role === 'reporter') {
      if (incident.reporter_id !== req.user!.id) {
        return res.status(403).json({ error: 'Forbidden: Cannot comment on another user\'s report' });
      }
      if (validated.visibility === 'internal') {
        return res.status(403).json({ error: 'Forbidden: Reporters cannot post internal authority notes' });
      }
      if (['closed', 'rejected'].includes(incident.status)) {
        return res.status(400).json({ error: 'Cannot post follow-up updates on closed or rejected reports' });
      }
    }

    const commentId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newComment = {
      id: commentId,
      incident_id: id,
      author_id: req.user!.id,
      author_name: req.user!.full_name || req.user!.email,
      author_role: req.user!.role,
      visibility: validated.visibility,
      content: validated.content,
      created_at: nowIso,
    };

    const existing = inMemoryComments.get(id) || [];
    existing.push(newComment);
    inMemoryComments.set(id, existing);

    // If an authority posts a public note, notify the reporter
    if (req.user!.role !== 'reporter' && validated.visibility === 'public') {
      await createNotification({
        userId: incident.reporter_id,
        incidentId: id,
        title: `Official Update: ${incident.reference_code}`,
        message: `An authority update was posted: "${validated.content.slice(0, 80)}..."`,
        type: 'public_update',
      });
    }

    return res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/:id/comments - Retrieve incident comments
router.get('/:id/comments', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const incident = inMemoryIncidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (req.user!.role === 'reporter' && incident.reporter_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comments = inMemoryComments.get(id) || [];
    const filtered = req.user!.role === 'reporter' ? comments.filter((c) => c.visibility === 'public') : comments;

    return res.json({ comments: filtered });
  } catch (err) {
    next(err);
  }
});

export default router;
