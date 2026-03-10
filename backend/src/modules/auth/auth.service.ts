import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateTokenId,
  hashToken,
} from '../../utils/token';
import { writeAuditLog, AUDIT_ACTIONS } from '../../utils/auditLog';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { Request } from 'express';
import { AuthResponse, AuthTokens } from './auth.types';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';
import { Role } from '../../constants/roles';
import { addDays } from 'date-fns';

// Generates a signed access and refresh token pair for a given user
async function generateTokenPair(
  userId: string,
  email: string,
  name: string,
  role: Role
): Promise<AuthTokens> {
  const tokenId = generateTokenId();

  const accessToken = signAccessToken({ userId, email, name, role });
  const refreshToken = signRefreshToken({ userId, tokenId });

  // Store hashed refresh token in the database for validation and revocation
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { accessToken, refreshToken };
}

// Registers a new user — only allowed if no existing user has the same email
export async function registerUser(
  input: RegisterInput,
  req: Request
): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: AUDIT_ACTIONS.USER_REGISTERED,
    resource: 'users',
    resourceId: user.id,
    req,
  });

  // New users have no project role yet — default to DEVELOPER for token until assigned
  const tokens = await generateTokenPair(user.id, user.email, user.name, 'DEVELOPER');

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'DEVELOPER',
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    tokens,
  };
}

// Authenticates a user by email and password and returns tokens on success
export async function loginUser(
  input: LoginInput,
  req: Request
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      projectMemberships: {
        orderBy: { joinedAt: 'desc' },
        take: 1,
      },
    },
  });

  // Use the same error message for both wrong email and wrong password to prevent enumeration
  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', HTTP_STATUS.UNAUTHORIZED);
  }

  const passwordMatch = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  // Use the role from the user's most recent project membership or default to DEVELOPER
  const role: Role =
    (user.projectMemberships[0]?.role as Role) ?? 'DEVELOPER';

  await writeAuditLog({
    userId: user.id,
    action: AUDIT_ACTIONS.USER_LOGIN,
    resource: 'users',
    resourceId: user.id,
    req,
  });

  const tokens = await generateTokenPair(user.id, user.email, user.name, role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    tokens,
  };
}

// Validates a refresh token and issues a new access and refresh token pair
export async function refreshTokens(
  refreshToken: string,
  req: Request
): Promise<AuthTokens> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Refresh token is invalid or expired', HTTP_STATUS.UNAUTHORIZED);
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new AppError('Refresh token is invalid or expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // Rotate the refresh token — revoke old one and issue a new pair
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revoked: true },
  });

  const memberships = await prisma.projectMember.findMany({
    where: { userId: payload.userId },
    orderBy: { joinedAt: 'desc' },
    take: 1,
  });

  const role: Role = (memberships[0]?.role as Role) ?? 'DEVELOPER';

  await writeAuditLog({
    userId: payload.userId,
    action: AUDIT_ACTIONS.TOKEN_REFRESHED,
    resource: 'auth',
    req,
  });

  return generateTokenPair(
    storedToken.user.id,
    storedToken.user.email,
    storedToken.user.name,
    role
  );
}

// Revokes the provided refresh token so it cannot be used again after logout
export async function logoutUser(
  refreshToken: string,
  req: Request
): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (storedToken) {
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { revoked: true },
    });

    await writeAuditLog({
      userId: storedToken.userId,
      action: AUDIT_ACTIONS.USER_LOGOUT,
      resource: 'auth',
      req,
    });
  }
}

// Updates a user's password after verifying their current password is correct
export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
  req: Request
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const passwordMatch = await comparePassword(input.currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
  }

  const newHash = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Revoke all existing refresh tokens so all sessions are invalidated after password change
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    resource: 'users',
    resourceId: userId,
    req,
  });
}