// Defines all valid task lifecycle statuses and priorities
export const TASK_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const;

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];