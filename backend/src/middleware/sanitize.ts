import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

// Recursively strips all HTML tags from a value to prevent XSS attacks
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeValue(v),
      ])
    );
  }
  return value;
}

// Sanitizes all string values in req.body before they reach the route handler
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  next();
}