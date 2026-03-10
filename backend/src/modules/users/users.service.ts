import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { getPaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { PaginatedResult } from '../../types';
import { UserProfile } from './users.types';
import { UpdateProfileInput, ListUsersQuery } from './users.schema';

// Strips the password hash and returns only safe user fields
function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Fetches a single user by ID and throws if not found
export async function getUserById(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  return sanitizeUser(user);
}

// Updates a user's name or avatar and returns the updated profile
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
  avatarUrl?: string
): Promise<UserProfile> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(avatarUrl && { avatarUrl }),
    },
  });

  return sanitizeUser(updated);
}

// Returns a paginated list of all users with optional name or email search
export async function listUsers(
  query: ListUsersQuery
): Promise<PaginatedResult<UserProfile>> {
  const { skip, take, page, limit } = getPaginationParams(query);

  const where = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return buildPaginatedResult(users.map(sanitizeUser), total, page, limit);
}

// Deactivates a user account so they can no longer log in
export async function deactivateUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  // Revoke all active refresh tokens so the user is immediately logged out
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}