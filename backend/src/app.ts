import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { sanitizeBody } from './middleware/sanitize';


const app: Application = express();

// ─── SECURITY HEADERS ─────────────────────────────────
// Sets secure HTTP headers to protect against common web vulnerabilities
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────
// Restricts API access to the whitelisted frontend origin only
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── RATE LIMITING ────────────────────────────────────
// Applies global rate limiting to all incoming requests
app.use(globalRateLimiter);

// ─── BODY PARSING ─────────────────────────────────────
// Parses incoming JSON bodies and limits payload size to prevent abuse
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── LOGGING ──────────────────────────────────────────
// Logs every incoming HTTP request
app.use(requestLogger);

// ─── SANITIZATION ─────────────────────────────────────
// Strips HTML from all request body fields to prevent XSS attacks
app.use(sanitizeBody);

// ─── HEALTH CHECK ─────────────────────────────────────
// Public endpoint to verify the API is running
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

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);

// ─── 404 HANDLER ──────────────────────────────────────
// Catches any request that does not match a registered route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────
// Must be registered last — handles all errors passed via next(error)
app.use(errorHandler);

export default app;