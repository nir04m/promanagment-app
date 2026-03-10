import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { getPaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { writeAuditLog, AUDIT_ACTIONS } from '../../utils/auditLog';
import { PaginatedResult } from '../../types';
import { Request } from 'express';
import { ProjectResponse } from './projects.types';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from './projects.schema';

// Creates a new project and automatically adds the PM as its first member
export async function createProject(
  input: CreateProjectInput,
  ownerId: string,
  req: Request
): Promise<ProjectResponse> {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: 'PM',
        },
      },
    },
    include: {
      _count: { select: { members: true, tasks: true } },
    },
  });

  await writeAuditLog({
    userId: ownerId,
    action: AUDIT_ACTIONS.PROJECT_CREATED,
    resource: 'projects',
    resourceId: project.id,
    req,
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    deadline: project.deadline,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    memberCount: project._count.members,
    taskCount: project._count.tasks,
  };
}

// Returns a paginated list of projects the requesting user is a member of
export async function listProjects(
  userId: string,
  userRole: string,
  query: ListProjectsQuery
): Promise<PaginatedResult<ProjectResponse>> {
  const { skip, take, page, limit } = getPaginationParams(query);

  // PM sees all projects they own — other roles see only projects they are members of
  const where = {
    ...(query.status && { status: query.status }),
    ...(query.search && {
      name: { contains: query.search, mode: 'insensitive' as const },
    }),
    members: {
      some: { userId },
    },
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true, tasks: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const data: ProjectResponse[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    deadline: p.deadline,
    ownerId: p.ownerId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    memberCount: p._count.members,
    taskCount: p._count.tasks,
  }));

  return buildPaginatedResult(data, total, page, limit);
}

// Returns a single project by ID — verifies the user is a member before returning
export async function getProjectById(
  projectId: string,
  userId: string
): Promise<ProjectResponse> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { members: true, tasks: true } },
      members: { where: { userId } },
    },
  });

  if (!project) {
    throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  if (project.members.length === 0) {
    throw new AppError('You do not have access to this project', HTTP_STATUS.FORBIDDEN);
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    deadline: project.deadline,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    memberCount: project._count.members,
    taskCount: project._count.tasks,
  };
}

// Updates a project's details — only the project owner can do this
export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput,
  req: Request
): Promise<ProjectResponse> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  if (project.ownerId !== userId) {
    throw new AppError('Only the project owner can update this project', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.deadline !== undefined && {
        deadline: input.deadline ? new Date(input.deadline) : null,
      }),
    },
    include: {
      _count: { select: { members: true, tasks: true } },
    },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.PROJECT_UPDATED,
    resource: 'projects',
    resourceId: projectId,
    req,
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    status: updated.status,
    deadline: updated.deadline,
    ownerId: updated.ownerId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    memberCount: updated._count.members,
    taskCount: updated._count.tasks,
  };
}

// Deletes a project and all its associated tasks and members — owner only
export async function deleteProject(
  projectId: string,
  userId: string,
  req: Request
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  if (project.ownerId !== userId) {
    throw new AppError('Only the project owner can delete this project', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.project.delete({ where: { id: projectId } });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.PROJECT_DELETED,
    resource: 'projects',
    resourceId: projectId,
    req,
  });
}