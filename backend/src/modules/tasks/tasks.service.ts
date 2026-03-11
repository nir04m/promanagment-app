import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { getPaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { writeAuditLog, AUDIT_ACTIONS } from '../../utils/auditLog';
import { PaginatedResult } from '../../types';
import { Request } from 'express';
import { TaskResponse } from './tasks.types';
import { CreateTaskInput, UpdateTaskInput, ListTasksQuery } from './tasks.schema';
import { createNotification } from '../notifications/notifications.service';

// Formats a raw Prisma task record into the client-safe TaskResponse shape
function formatTask(task: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  position: number;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignee: { id: string; name: string; email: string; avatarUrl: string | null } | null;
  creator: { id: string; name: string; email: string };
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    position: task.position,
    projectId: task.projectId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee: task.assignee,
    creator: task.creator,
  };
}

// Verifies a user is a member of the project and returns their project role
async function verifyProjectMembership(
  userId: string,
  projectId: string
): Promise<string> {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new AppError('You do not have access to this project', HTTP_STATUS.FORBIDDEN);
  }

  return membership.projectRole;
}

// Creates a new task — any project member can create tasks
export async function createTask(
  projectId: string,
  input: CreateTaskInput,
  creatorId: string,
  req: Request
): Promise<TaskResponse> {
  const projectRole = await verifyProjectMembership(creatorId, projectId);

  // Only PM can assign tasks to other users on creation
  if (input.assigneeId && input.assigneeId !== creatorId && projectRole !== 'PM') {
    throw new AppError('Only a PM can assign tasks to other members', HTTP_STATUS.FORBIDDEN);
  }

  // Verify assignee is a project member if provided
  if (input.assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: input.assigneeId, projectId },
      },
    });

    if (!assigneeMembership) {
      throw new AppError('Assignee is not a member of this project', HTTP_STATUS.BAD_REQUEST);
    }
  }

  // Get the highest position in the BACKLOG column to place new task at the end
  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: 'BACKLOG' },
    orderBy: { position: 'desc' },
  });

  const position = lastTask ? lastTask.position + 1 : 0;

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assigneeId: input.assigneeId ?? undefined,
      projectId,
      creatorId,
      position,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  await writeAuditLog({
    userId: creatorId,
    action: AUDIT_ACTIONS.TASK_CREATED,
    resource: 'tasks',
    resourceId: task.id,
    metadata: { projectId, title: input.title },
    req,
  });

  // Notify assignee if task was assigned to someone other than the creator
  if (input.assigneeId && input.assigneeId !== creatorId) {
    await createNotification({
      userId: input.assigneeId,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned to you',
      message: `You have been assigned the task: ${input.title}`,
      payload: { taskId: task.id, projectId },
    });
  }

  return formatTask(task);
}

// Returns a paginated and filtered list of tasks for a project
export async function listTasks(
  projectId: string,
  userId: string,
  query: ListTasksQuery
): Promise<PaginatedResult<TaskResponse>> {
  const projectRole = await verifyProjectMembership(userId, projectId);
  const { skip, take, page, limit } = getPaginationParams(query);

  const where = {
    projectId,
    // Non-PM members only see tasks assigned to them or created by them
    ...(projectRole !== 'PM' && {
      OR: [{ assigneeId: userId }, { creatorId: userId }],
    }),
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
    ...(query.assigneeId && { assigneeId: query.assigneeId }),
    ...(query.search && {
      title: { contains: query.search, mode: 'insensitive' as const },
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return buildPaginatedResult(tasks.map(formatTask), total, page, limit);
}

// Returns a single task by ID — verifies user is a project member
export async function getTaskById(
  taskId: string,
  userId: string
): Promise<TaskResponse> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task) {
    throw new AppError('Task not found', HTTP_STATUS.NOT_FOUND);
  }

  await verifyProjectMembership(userId, task.projectId);

  return formatTask(task);
}

// Updates a task — PM can update anything, others can only update their own tasks
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  userId: string,
  req: Request
): Promise<TaskResponse> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError('Task not found', HTTP_STATUS.NOT_FOUND);
  }

  const projectRole = await verifyProjectMembership(userId, task.projectId);

  // Non-PM members can only update tasks assigned to them or created by them
  if (
    projectRole !== 'PM' &&
    task.assigneeId !== userId &&
    task.creatorId !== userId
  ) {
    throw new AppError('You can only update tasks assigned to or created by you', HTTP_STATUS.FORBIDDEN);
  }

  // Only PM can reassign tasks to other members
  if (input.assigneeId !== undefined && input.assigneeId !== userId && projectRole !== 'PM') {
    throw new AppError('Only a PM can reassign tasks to other members', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.position !== undefined && { position: input.position }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.TASK_UPDATED,
    resource: 'tasks',
    resourceId: taskId,
    metadata: { changes: input },
    req,
  });

  // Notify new assignee if task was reassigned to someone other than the updater
  if (
    input.assigneeId &&
    input.assigneeId !== userId &&
    input.assigneeId !== task.assigneeId
  ) {
    await createNotification({
      userId: input.assigneeId,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned to you',
      message: `You have been assigned the task: ${task.title}`,
      payload: { taskId: task.id, projectId: task.projectId },
    });
  }

  return formatTask(updated);
}

// Allows any project member to assign an unassigned task to themselves
export async function selfAssignTask(
  taskId: string,
  userId: string,
  req: Request
): Promise<TaskResponse> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError('Task not found', HTTP_STATUS.NOT_FOUND);
  }

  await verifyProjectMembership(userId, task.projectId);

  if (task.assigneeId && task.assigneeId !== userId) {
    throw new AppError('This task is already assigned to another member', HTTP_STATUS.CONFLICT);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: userId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.TASK_ASSIGNED,
    resource: 'tasks',
    resourceId: taskId,
    metadata: { assignedTo: userId },
    req,
  });

  return formatTask(updated);
}

// Deletes a task — PM only
export async function deleteTask(
  taskId: string,
  userId: string,
  req: Request
): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError('Task not found', HTTP_STATUS.NOT_FOUND);
  }

  const projectRole = await verifyProjectMembership(userId, task.projectId);

  if (projectRole !== 'PM') {
    throw new AppError('Only a PM can delete tasks', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.task.delete({ where: { id: taskId } });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.TASK_DELETED,
    resource: 'tasks',
    resourceId: taskId,
    metadata: { projectId: task.projectId, title: task.title },
    req,
  });
}