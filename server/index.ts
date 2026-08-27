import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config, logger } from './config.js';
import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import teamRoutes from './routes/team.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for Leaflet map tiles and inline images
  })
);

app.use(
  cors({
    origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Emergency Response Desk API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    gemini_status: config.geminiApiKey ? 'enabled' : 'disabled (using deterministic fallback)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/incidents', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Production Static File Serving (if built)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

app.listen(config.port, () => {
  logger.info(`🚨 Emergency Response Desk Backend running on http://localhost:${config.port}`);
});

export default app;
