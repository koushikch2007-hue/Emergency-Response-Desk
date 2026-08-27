import dotenv from 'dotenv';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://demo-emergency-response.supabase.co',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || 'demo_key',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isDev: process.env.NODE_ENV !== 'production',
};

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: config.isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true },
      }
    : undefined,
});

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
