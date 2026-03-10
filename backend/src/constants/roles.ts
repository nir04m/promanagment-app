// Defines all user roles available in the system
export const ROLES = {
  PM: 'PM',
  DESIGNER: 'DESIGNER',
  DEVELOPER: 'DEVELOPER',
  QA: 'QA',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];