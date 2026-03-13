export type SystemRole = 'ADMIN' | 'MEMBER';
export type ProjectRole = 'PM' | 'DESIGNER' | 'DEVELOPER' | 'QA';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMMENTED'
  | 'PROJECT_INVITE'
  | 'MEMBER_JOINED'
  | 'DEADLINE_APPROACHING';

export interface User {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  deadline: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  taskCount?: number;
}

export interface Member {
  id: string;
  userId: string;
  projectId: string;
  projectRole: ProjectRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  meta?: PaginationMeta;
}

export interface ProjectReport {
  projectId: string;
  projectName: string;
  status: string;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionPercentage: number;
  overdueTaskCount: number;
  memberCount: number;
  memberContributions: {
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    projectRole: string;
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  }[];
}

export interface MyReport {
  userId: string;
  totalAssigned: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  tasksByProject: {
    projectId: string;
    projectName: string;
    projectRole: string;
    assignedTasks: number;
    completedTasks: number;
  }[];
}