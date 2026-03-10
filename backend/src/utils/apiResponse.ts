import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

// Sends a standardized success response with optional data and metadata
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = HTTP_STATUS.OK as number,
  meta?: Record<string, unknown>
): void {
  const body: Record<string, unknown> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    body['meta'] = meta;
  }

  res.status(statusCode).json(body);
}

// Sends a standardized error response with a message and optional details
export function sendError(
  res: Response,
  message: string,
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR as number,
  errors?: unknown
): void {
  const body: Record<string, unknown> = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    body['errors'] = errors;
  }

  res.status(statusCode).json(body);
}

// Sends a 201 Created response after a successful resource creation
export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED as number);
}

// Sends a 204 No Content response after a successful deletion
export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}