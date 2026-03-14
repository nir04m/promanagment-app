import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { sanitizeBody } from './middleware/sanitize';

const app: Application = express();

// In production the frontend build is expected at ../public relative to dist/
// Example:
//   backend/dist -> compiled backend
//   backend/public -> copied frontend build (index.html + assets/)
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const HAS_STATIC = fs.existsSync(path.join(PUBLIC_DIR, 'index.html'));

// Helpful startup logs
console.log('PUBLIC_DIR:', PUBLIC_DIR);
console.log('HAS_STATIC:', HAS_STATIC);
console.log(
  'INDEX_HTML_EXISTS:',
  fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))
);

// ─── SECURITY HEADERS ─────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: HAS_STATIC
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
          },
        }
      : false,
  })
);

// ─── CORS ─────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── RATE LIMITING ────────────────────────────────────
app.use(globalRateLimiter);

// ─── BODY PARSING ─────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── LOGGING ──────────────────────────────────────────
app.use(requestLogger);

// ─── SANITIZATION ─────────────────────────────────────
app.use(sanitizeBody);

// ─── STATIC FILES ─────────────────────────────────────
if (HAS_STATIC) {
  app.use(express.static(PUBLIC_DIR));
}

// ─── HEALTH CHECK ─────────────────────────────────────
app.get(`/api/${env.API_VERSION}/health`, (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ProManagement API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import projectRoutes from './modules/projects/projects.routes';
import memberRoutes from './modules/members/members.routes';
import taskRoutes from './modules/tasks/tasks.routes';
import commentRoutes from './modules/comments/comments.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import reportRoutes from './modules/reports/reports.routes';

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/projects`, projectRoutes);
app.use(`/api/${env.API_VERSION}/projects/:projectId/members`, memberRoutes);
app.use(`/api/${env.API_VERSION}/projects/:projectId/tasks`, taskRoutes);
app.use(`/api/${env.API_VERSION}/tasks/:taskId/comments`, commentRoutes);
app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${env.API_VERSION}/reports`, reportRoutes);

// ─── SPA FALLBACK ─────────────────────────────────────
if (HAS_STATIC) {
  app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

// ─── 404 HANDLER ──────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────
app.use(errorHandler);

export default app;