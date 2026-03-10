import { Request, Response, NextFunction } from 'express';
import { SystemRole, ProjectRole } from '../constants/roles';
import { HTTP_STATUS } from '../constants/httpStatus';

// Checks the user's system role for platform-level route protection
export function authorizeSystem(...allowedRoles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.systemRole)) {
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

// Checks the user's project role for project-level route protection
export function authorizeProject(...allowedRoles: ProjectRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.projectRole) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Project role not found for this user',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.projectRole)) {
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