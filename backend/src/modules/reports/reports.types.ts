// Defines the shape of the full project progress report
export interface ProjectReportResponse {
  projectId: string;
  projectName: string;
  status: string;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionPercentage: number;
  overdueTaskCount: number;
  memberCount: number;
  memberContributions: MemberContribution[];
}

// Defines each member's task contribution summary
export interface MemberContribution {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  projectRole: string;
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

// Defines the shape of a personal task summary report
export interface MyReportResponse {
  userId: string;
  totalAssigned: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  tasksByProject: ProjectTaskSummary[];
}

// Defines per-project task breakdown in the personal report
export interface ProjectTaskSummary {
  projectId: string;
  projectName: string;
  projectRole: string;
  assignedTasks: number;
  completedTasks: number;
}