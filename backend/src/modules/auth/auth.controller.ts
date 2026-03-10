import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  changePassword,
} from './auth.service';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.schema';

// Handles user registration and returns the created user with tokens
export const register = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await registerUser(input, req);
  sendCreated(res, result, 'Account created successfully');
});

// Handles user login and returns the authenticated user with tokens
export const login = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const result = await loginUser(input, req);
  sendSuccess(res, result, 'Login successful');
});

// Handles token refresh and returns a new access and refresh token pair
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await refreshTokens(refreshToken, req);
  sendSuccess(res, tokens, 'Tokens refreshed successfully');
});

// Handles user logout by revoking the provided refresh token
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  await logoutUser(refreshToken, req);
  sendNoContent(res);
});

// Handles password change for the currently authenticated user
export const updatePassword = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as ChangePasswordInput;
  await changePassword(req.user!.id, input, req);
  sendNoContent(res);
});

// Returns the currently authenticated user's profile from the token
export const getMe = catchAsync(async (req: Request, res: Response) => {
  sendSuccess(res, req.user, 'User retrieved successfully');
});