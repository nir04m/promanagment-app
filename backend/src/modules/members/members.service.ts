import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { writeAuditLog, AUDIT_ACTIONS } from '../../utils/auditLog';
import { Request } from 'express';
import { MemberResponse } from './members.types';
import { AddMemberInput, UpdateMemberRoleInput } from './members.schema';

// Formats a raw project member record into the client-safe MemberResponse shape
function formatMember(member: {
  id: string;
  userId: string;
  projectId: string;
  projectRole: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}): MemberResponse {
  return {
    id: member.id,
    userId: member.userId,
    projectId: member.projectId,
    projectRole: member.projectRole,
    joinedAt: member.joinedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
    },
  };
}

// Returns all members of a project — only accessible to members of that project
export async function getProjectMembers(
  projectId: string,
  requestingUserId: string
): Promise<MemberResponse[]> {
  // Verify the requesting user is a member of this project
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: requestingUserId,
        projectId,
      },
    },
  });

  if (!membership) {
    throw new AppError('You do not have access to this project', HTTP_STATUS.FORBIDDEN);
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members.map(formatMember);
}

// Adds a user to a project with a specified project role — ADMIN only
export async function addMemberToProject(
  projectId: string,
  input: AddMemberInput,
  requestingUserId: string,
  req: Request
): Promise<MemberResponse> {
  // Verify the project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  // Verify the user being added exists and is active
  const userToAdd = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!userToAdd) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  if (!userToAdd.isActive) {
    throw new AppError('Cannot add a deactivated user to a project', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if the user is already a member of this project
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: input.userId,
        projectId,
      },
    },
  });

  if (existingMember) {
    throw new AppError('User is already a member of this project', HTTP_STATUS.CONFLICT);
  }

  const member = await prisma.projectMember.create({
    data: {
      userId: input.userId,
      projectId,
      projectRole: input.projectRole,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  await writeAuditLog({
    userId: requestingUserId,
    action: AUDIT_ACTIONS.MEMBER_INVITED,
    resource: 'project_members',
    resourceId: member.id,
    metadata: { projectId, addedUserId: input.userId, projectRole: input.projectRole },
    req,
  });

  return formatMember(member);
}

// Updates a member's project role — ADMIN only
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  input: UpdateMemberRoleInput,
  requestingUserId: string,
  req: Request
): Promise<MemberResponse> {
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!member || member.projectId !== projectId) {
    throw new AppError('Member not found in this project', HTTP_STATUS.NOT_FOUND);
  }

  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: { projectRole: input.projectRole },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  await writeAuditLog({
    userId: requestingUserId,
    action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
    resource: 'project_members',
    resourceId: memberId,
    metadata: {
      projectId,
      affectedUserId: member.userId,
      oldRole: member.projectRole,
      newRole: input.projectRole,
    },
    req,
  });

  return formatMember(updated);
}

// Removes a member from a project — ADMIN only
export async function removeMemberFromProject(
  projectId: string,
  memberId: string,
  requestingUserId: string,
  req: Request
): Promise<void> {
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.projectId !== projectId) {
    throw new AppError('Member not found in this project', HTTP_STATUS.NOT_FOUND);
  }

  // Prevent removing the only PM from a project
  if (member.projectRole === 'PM') {
    const pmCount = await prisma.projectMember.count({
      where: { projectId, projectRole: 'PM' },
    });

    if (pmCount <= 1) {
      throw new AppError(
        'Cannot remove the only PM from a project. Assign another PM first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  await prisma.projectMember.delete({ where: { id: memberId } });

  await writeAuditLog({
    userId: requestingUserId,
    action: AUDIT_ACTIONS.MEMBER_REMOVED,
    resource: 'project_members',
    resourceId: memberId,
    metadata: { projectId, removedUserId: member.userId },
    req,
  });
}

// Returns the project role of a specific user within a project
export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<string | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  return member?.projectRole ?? null;
}