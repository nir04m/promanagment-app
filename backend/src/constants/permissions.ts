import { SYSTEM_ROLES, PROJECT_ROLES, SystemRole, ProjectRole } from './roles';

// Actions controlled by system role — platform-wide operations
export const SYSTEM_PERMISSIONS: Record<string, SystemRole[]> = {
  INVITE_USER_TO_PLATFORM: [SYSTEM_ROLES.ADMIN],
  ASSIGN_PROJECT_ROLE: [SYSTEM_ROLES.ADMIN],
  DEACTIVATE_USER: [SYSTEM_ROLES.ADMIN],
  VIEW_ALL_USERS: [SYSTEM_ROLES.ADMIN],
  CREATE_PROJECT: [SYSTEM_ROLES.ADMIN],
};

// Actions controlled by project role — within a specific project
export const PROJECT_PERMISSIONS: Record<string, ProjectRole[]> = {
  ASSIGN_TASK_TO_ANYONE: [PROJECT_ROLES.PM],
  DELETE_TASK: [PROJECT_ROLES.PM],
  VIEW_ALL_TASKS: [PROJECT_ROLES.PM],
  VIEW_FULL_REPORTS: [PROJECT_ROLES.PM],
  UPDATE_PROJECT: [PROJECT_ROLES.PM],
  SELF_ASSIGN_TASK: [PROJECT_ROLES.PM, PROJECT_ROLES.DESIGNER, PROJECT_ROLES.DEVELOPER, PROJECT_ROLES.QA],
  CREATE_TASK: [PROJECT_ROLES.PM, PROJECT_ROLES.DESIGNER, PROJECT_ROLES.DEVELOPER, PROJECT_ROLES.QA],
  UPDATE_TASK: [PROJECT_ROLES.PM, PROJECT_ROLES.DESIGNER, PROJECT_ROLES.DEVELOPER, PROJECT_ROLES.QA],
  CREATE_COMMENT: [PROJECT_ROLES.PM, PROJECT_ROLES.DESIGNER, PROJECT_ROLES.DEVELOPER, PROJECT_ROLES.QA],
  UPLOAD_ATTACHMENT: [PROJECT_ROLES.PM, PROJECT_ROLES.DESIGNER, PROJECT_ROLES.DEVELOPER, PROJECT_ROLES.QA],
};

// Checks if a system role has platform-level permission for an action
export function hasSystemPermission(role: SystemRole, action: string): boolean {
  const allowed = SYSTEM_PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

// Checks if a project role has permission for an action within a project
export function hasProjectPermission(role: ProjectRole, action: string): boolean {
  const allowed = PROJECT_PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
}