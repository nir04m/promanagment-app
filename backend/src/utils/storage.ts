import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Allowed file types for upload validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Creates and returns a configured S3 client pointed at Backblaze B2
function createS3Client(): S3Client {
  return new S3Client({
    endpoint: env.B2_ENDPOINT,
    region: env.B2_BUCKET_REGION ?? 'us-east-005',
    credentials: {
      accessKeyId: env.B2_KEY_ID ?? '',
      secretAccessKey: env.B2_APP_KEY ?? '',
    },
  });
}

// Validates a file's MIME type and size before allowing upload
export function validateFile(
  mimeType: string,
  fileSizeBytes: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'File type not allowed' };
  }
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  return { valid: true };
}

// Uploads a file buffer to Backblaze B2 and returns the storage key
export async function uploadFile(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder: string;
}): Promise<{ key: string; url: string }> {
  const client = createS3Client();
  const ext = path.extname(params.originalName);
  const key = `${params.folder}/${uuidv4()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
    })
  );

  const url = `${env.B2_ENDPOINT}/${env.B2_BUCKET_NAME}/${key}`;
  return { key, url };
}

// Generates a temporary signed URL to securely serve a private file
export async function getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const client = createS3Client();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: expiresInSeconds }
  );
}

// Deletes a file from Backblaze B2 by its storage key
export async function deleteFile(key: string): Promise<void> {
  const client = createS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
    })
  );
}