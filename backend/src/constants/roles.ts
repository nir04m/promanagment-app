// System-level roles — controls platform access
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

// Project-level roles — controls what a user can do within a project
export const PROJECT_ROLES = {
  PM: 'PM',
  DESIGNER: 'DESIGNER',
  DEVELOPER: 'DEVELOPER',
  QA: 'QA',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
export type ProjectRole = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES];