import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_VERSION: z.string().default('v1'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Backblaze B2
  B2_ENDPOINT: z.string().optional(),
  B2_BUCKET_NAME: z.string().optional(),
  B2_BUCKET_REGION: z.string().optional(),
  B2_KEY_ID: z.string().optional(),
  B2_APP_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 587)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform((v) => parseInt(v, 10)),
  AUTH_RATE_LIMIT_MAX: z.string().default('5').transform((v) => parseInt(v, 10)),

  // Admin seed
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;