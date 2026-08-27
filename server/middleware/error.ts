import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err: err.message, stack: err.stack, path: req.path }, 'API Error Encountered');

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
