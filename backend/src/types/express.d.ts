import { Role } from '../constants/roles';

// Extends the Express Request type to include the authenticated user on every protected route
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      role: Role;
      projectId?: string;
    };
  }
}