import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/httpStatus';

// General rate limiter applied to all API routes
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

// Strict rate limiter applied only to auth routes to prevent brute force attacks
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});