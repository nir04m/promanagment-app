import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';
import { HTTP_STATUS } from '../constants/httpStatus';

// Checks that the authenticated user has one of the required roles for the route
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}