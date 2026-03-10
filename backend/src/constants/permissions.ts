import { ROLES, Role } from './roles';

// Maps each action to the roles that are allowed to perform it
export const PERMISSIONS: Record<string, Role[]> = {
  // Project actions
  CREATE_PROJECT: [ROLES.PM],
  DELETE_PROJECT: [ROLES.PM],
  UPDATE_PROJECT: [ROLES.PM],
  VIEW_ALL_PROJECTS: [ROLES.PM],

  // Member actions
  INVITE_MEMBER: [ROLES.PM],
  REMOVE_MEMBER: [ROLES.PM],
  ASSIGN_ROLE: [ROLES.PM],
  VIEW_ALL_MEMBERS: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],

  // Task actions
  ASSIGN_TASK_TO_ANYONE: [ROLES.PM],
  SELF_ASSIGN_TASK: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],
  CREATE_TASK: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],
  DELETE_TASK: [ROLES.PM],
  UPDATE_TASK: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],
  VIEW_ALL_TASKS: [ROLES.PM],
  VIEW_ASSIGNED_TASKS: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],

  // Report actions
  VIEW_FULL_REPORTS: [ROLES.PM],
  VIEW_OWN_REPORTS: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],

  // Comment and attachment actions
  CREATE_COMMENT: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],
  UPLOAD_ATTACHMENT: [ROLES.PM, ROLES.DESIGNER, ROLES.DEVELOPER, ROLES.QA],
};

// Checks if a given role has permission to perform an action
export function hasPermission(role: Role, action: string): boolean {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}