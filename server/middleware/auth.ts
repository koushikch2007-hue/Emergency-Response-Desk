import { Request, Response, NextFunction } from 'express';
import { supabase, logger } from '../config.js';

export interface AuthUser {
  id: string;
  email?: string;
  role: 'reporter' | 'authority' | 'admin';
  full_name?: string;
  department?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const devUserHeader = req.headers['x-demo-user-id'] as string;
  const devRoleHeader = req.headers['x-demo-role'] as string;

  // Demo / Local development header bypass for rapid testing
  if (devUserHeader) {
    req.user = {
      id: devUserHeader,
      email: `${devRoleHeader || 'reporter'}@emergency.gov`,
      role: (devRoleHeader as any) || 'reporter',
      full_name: `Demo User (${devRoleHeader || 'reporter'})`,
      department: devRoleHeader === 'authority' ? 'Fire & Rescue Dept' : undefined,
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    }

    // Fetch user profile role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, department')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'reporter',
      full_name: profile?.full_name || user.user_metadata?.full_name,
      department: profile?.department,
    };

    next();
  } catch (err: any) {
    logger.error({ err: err.message }, 'Authentication middleware error');
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}

export function requireRole(allowedRoles: ('reporter' | 'authority' | 'admin')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
