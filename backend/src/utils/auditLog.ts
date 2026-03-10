import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

interface AuditLogParams {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}

// Writes a record of a sensitive or important user action to the audit_logs table
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? undefined,
        ipAddress: params.req?.ip ?? undefined,
        userAgent: params.req?.get('user-agent') ?? undefined,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (error) {
    // Audit log failure must never crash the main request flow
    console.error('Audit log write failed:', error);
  }
}

// Predefined audit action constants to keep action names consistent across the codebase
export const AUDIT_ACTIONS = {
  // Auth
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',

  // Projects
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',

  // Members
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',

  // Tasks
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
} as const;