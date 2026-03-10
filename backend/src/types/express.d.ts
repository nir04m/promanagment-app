import { SystemRole, ProjectRole } from '../constants/roles';

// Extends Express Request with the authenticated user and optional project role
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      systemRole: SystemRole;
    };
    projectRole?: ProjectRole;
  }
}