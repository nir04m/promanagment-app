import { z } from 'zod';

// Validates the request body for updating a user profile
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .optional(),
});

// Validates query parameters for listing users
export const listUsersQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  search: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;