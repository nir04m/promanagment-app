import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ProjectReportResponse, MyReportResponse } from './reports.types';

// Returns a full project progress report — PM only
export async function getProjectReport(
  projectId: string,
  userId: string
): Promise<ProjectReportResponse> {
  // Verify user is a PM in this project
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new AppError('You do not have access to this project', HTTP_STATUS.FORBIDDEN);
  }

  if (membership.projectRole !== 'PM') {
    throw new AppError('Only a PM can view the full project report', HTTP_STATUS.FORBIDDEN);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: true,
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  const now = new Date();
  const tasks = project.tasks;

  // Calculate task counts grouped by status
  const tasksByStatus: Record<string, number> = {
    BACKLOG: 0,
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  // Calculate task counts grouped by priority
  const tasksByPriority: Record<string, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  let overdueTaskCount = 0;

  tasks.forEach((task) => {
    tasksByStatus[task.status] = (tasksByStatus[task.status] ?? 0) + 1;
    tasksByPriority[task.priority] = (tasksByPriority[task.priority] ?? 0) + 1;

    if (task.dueDate && task.dueDate < now && task.status !== 'DONE') {
      overdueTaskCount++;
    }
  });

  const completedTasks = tasksByStatus['DONE'] ?? 0;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Build per-member contribution summary
  const memberContributions = project.members.map((member) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === member.userId);
    const completed = memberTasks.filter((t) => t.status === 'DONE').length;
    const inProgress = memberTasks.filter((t) => t.status === 'IN_PROGRESS').length;

    return {
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
      projectRole: member.projectRole,
      assignedTasks: memberTasks.length,
      completedTasks: completed,
      inProgressTasks: inProgress,
    };
  });

  return {
    projectId: project.id,
    projectName: project.name,
    status: project.status,
    totalTasks: tasks.length,
    tasksByStatus,
    tasksByPriority,
    completionPercentage,
    overdueTaskCount,
    memberCount: project.members.length,
    memberContributions,
  };
}

// Returns a personal task summary report for the authenticated user
export async function getMyReport(userId: string): Promise<MyReportResponse> {
  const now = new Date();

  // Get all tasks assigned to the user across all projects
  const assignedTasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  const completed = assignedTasks.filter((t) => t.status === 'DONE').length;
  const inProgress = assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdue = assignedTasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== 'DONE'
  ).length;

  const completionPercentage =
    assignedTasks.length > 0
      ? Math.round((completed / assignedTasks.length) * 100)
      : 0;

  // Get all projects the user is a member of
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: { project: { select: { id: true, name: true } } },
  });

  // Build per-project task breakdown
  const tasksByProject = memberships.map((membership) => {
    const projectTasks = assignedTasks.filter(
      (t) => t.projectId === membership.projectId
    );
    const projectCompleted = projectTasks.filter((t) => t.status === 'DONE').length;

    return {
      projectId: membership.project.id,
      projectName: membership.project.name,
      projectRole: membership.projectRole,
      assignedTasks: projectTasks.length,
      completedTasks: projectCompleted,
    };
  });

  return {
    userId,
    totalAssigned: assignedTasks.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    overdueTasks: overdue,
    completionPercentage,
    tasksByProject,
  };
}