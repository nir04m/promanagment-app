import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import {
  getProjectMembers,
  addMemberToProject,
  updateMemberRole,
  removeMemberFromProject,
} from './members.service';
import { AddMemberInput, UpdateMemberRoleInput } from './members.schema';

// Returns all members of a project
export const listMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await getProjectMembers(req.params.projectId, req.user!.id);
  sendSuccess(res, members, 'Members retrieved successfully');
});

// Adds a user to a project with a specified role — ADMIN only
export const addMember = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as AddMemberInput;
  const member = await addMemberToProject(
    req.params.projectId,
    input,
    req.user!.id,
    req
  );
  sendCreated(res, member, 'Member added successfully');
});

// Updates a member's project role — ADMIN only
export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as UpdateMemberRoleInput;
  const member = await updateMemberRole(
    req.params.projectId,
    req.params.memberId,
    input,
    req.user!.id,
    req
  );
  sendSuccess(res, member, 'Member role updated successfully');
});

// Removes a member from a project — ADMIN only
export const removeMember = catchAsync(async (req: Request, res: Response) => {
  await removeMemberFromProject(
    req.params.projectId,
    req.params.memberId,
    req.user!.id,
    req
  );
  sendNoContent(res);
});