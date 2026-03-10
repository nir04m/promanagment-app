import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from './requestLogger';
import { HTTP_STATUS } from '../constants/httpStatus';

// Custom application error class that carries an HTTP status code
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler — catches all errors and returns a consistent JSON response
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'A record with this value already exists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // Known operational errors thrown by AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Unknown errors — log full details but never expose internals to client
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
}