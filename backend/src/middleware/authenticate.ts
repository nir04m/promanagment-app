import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { HTTP_STATUS } from '../constants/httpStatus';

// Verifies the JWT access token and attaches the user's identity and system role to the request
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Access token is missing or malformed',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Access token is missing',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      systemRole: payload.systemRole,
    };
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Access token is invalid or expired',
      timestamp: new Date().toISOString(),
    });
  }
}