import { z } from 'zod';

// Validates the request body for adding a member to a project
export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  projectRole: z.enum(['PM', 'DESIGNER', 'DEVELOPER', 'QA']),
});

// Validates the request body for updating a member's project role
export const updateMemberRoleSchema = z.object({
  projectRole: z.enum(['PM', 'DESIGNER', 'DEVELOPER', 'QA']),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;