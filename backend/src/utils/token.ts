import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { SystemRole } from '../constants/roles';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  systemRole: SystemRole;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

// Signs a short-lived JWT access token with the user's identity and system role
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'promanagement-app',
    audience: 'promanagement-client',
  } as jwt.SignOptions);
}

// Signs a long-lived JWT refresh token used to issue new access tokens
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'promanagement-app',
    audience: 'promanagement-client',
  } as jwt.SignOptions);
}

// Verifies and decodes a JWT access token — throws if invalid or expired
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'promanagement-app',
    audience: 'promanagement-client',
  }) as TokenPayload;
}

// Verifies and decodes a JWT refresh token — throws if invalid or expired
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'promanagement-app',
    audience: 'promanagement-client',
  }) as RefreshTokenPayload;
}

// Generates a cryptographically secure random string used as a refresh token identifier
export function generateTokenId(): string {
  return crypto.randomBytes(40).toString('hex');
}

// Creates a SHA-256 hash of a token before storing it in the database
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}