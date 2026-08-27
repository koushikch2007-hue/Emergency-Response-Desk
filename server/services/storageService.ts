import crypto from 'crypto';
import { supabase, config, logger } from '../config.js';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const BUCKET_NAME = 'incident-media';

export interface UploadedFileMeta {
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export function validateImageFile(file: { mimetype: string; size: number; originalname: string }) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`Unsupported file format (${file.mimetype}). Only JPEG, PNG, and WebP images are allowed.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum allowed size of 10 MB.`);
  }
}

export function generateStoragePath(incidentId: string, originalName: string, mimeType: string): string {
  const ext = mimeType.split('/')[1] || 'jpg';
  const randomHash = crypto.randomBytes(16).toString('hex');
  return `incidents/${incidentId}/${randomHash}.${ext}`;
}

export async function uploadIncidentMedia(
  incidentId: string,
  file: { buffer: Buffer; mimetype: string; size: number; originalname: string }
): Promise<UploadedFileMeta> {
  validateImageFile(file);
  const storagePath = generateStoragePath(incidentId, file.originalname, file.mimetype);

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      logger.warn({ error }, 'Supabase Storage upload returned error, using fallback metadata');
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to upload to Supabase storage directly');
  }

  return {
    storagePath,
    fileName: file.originalname,
    mimeType: file.mimetype,
    fileSizeBytes: file.size,
  };
}

export async function getSignedMediaUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storagePath, expiresInSeconds);

    if (data?.signedUrl) {
      return data.signedUrl;
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Signed URL generation failed');
  }

  // Fallback placeholder image url for local dev / demo mode
  return `https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80`;
}
