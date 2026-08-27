import { supabase, logger } from '../config.js';

export interface CreateNotificationParams {
  userId: string;
  incidentId?: string;
  title: string;
  message: string;
  type?: 'submission' | 'acknowledgment' | 'assignment' | 'status_change' | 'public_update' | 'resolution' | 'closure' | 'rejection';
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      incident_id: params.incidentId || null,
      title: params.title,
      message: params.message,
      type: params.type || 'status_change',
      is_read: false,
    });

    if (error) {
      logger.warn({ error, params }, 'Failed to insert notification into database');
    } else {
      logger.info({ userId: params.userId, title: params.title }, 'Notification created successfully');
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Notification creation exception');
  }
}
