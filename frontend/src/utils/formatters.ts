import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import { TaskPriority, TaskStatus, ProjectStatus, ProjectRole } from '@/types';

// Returns a human-readable relative time string from an ISO date string
export function timeAgo(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return formatDistanceToNow(date, { addSuffix: true });
}

// Formats an ISO date string to a readable short date
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No date';
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return format(date, 'MMM dd, yyyy');
}

// Formats an ISO date string to date and time
export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return format(date, 'MMM dd, yyyy HH:mm');
}

// Returns the display label for a task status value
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    BACKLOG: 'Backlog',
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
  };
  return labels[status] ?? status;
}

// Returns the display label for a task priority value
export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[priority] ?? priority;
}

// Returns the display label for a project status value
export function getProjectStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    PLANNING: 'Planning',
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] ?? status;
}

// Returns the display label for a project role value
export function getProjectRoleLabel(role: ProjectRole): string {
  const labels: Record<ProjectRole, string> = {
    PM: 'Project Manager',
    DESIGNER: 'Designer',
    DEVELOPER: 'Developer',
    QA: 'QA Engineer',
  };
  return labels[role] ?? role;
}

// Returns initials from a full name for avatar fallback display
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}