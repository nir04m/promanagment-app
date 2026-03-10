import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendNoContent } from '../../utils/apiResponse';
import { validateFile, uploadFile } from '../../utils/storage';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import {
  getUserById,
  updateUserProfile,
  listUsers,
  deactivateUser,
} from './users.service';
import { UpdateProfileInput, ListUsersQuery } from './users.schema';

// Returns the full profile of the currently authenticated user
export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.id);
  sendSuccess(res, user, 'Profile retrieved successfully');
});

// Returns the profile of any user by their ID
export const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.userId);
  sendSuccess(res, user, 'User retrieved successfully');
});

// Updates the authenticated user's name and optionally their avatar
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as UpdateProfileInput;
  let avatarUrl: string | undefined;

  if (req.file) {
    const validation = validateFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      throw new AppError(validation.error ?? 'Invalid file', HTTP_STATUS.BAD_REQUEST);
    }

    const uploaded = await uploadFile({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      folder: 'avatars',
    });

    avatarUrl = uploaded.url;
  }

  const user = await updateUserProfile(req.user!.id, input, avatarUrl);
  sendSuccess(res, user, 'Profile updated successfully');
});

// Returns a paginated list of all users — accessible by PM only
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQuery;
  const result = await listUsers(query);
  sendSuccess(res, result.data, 'Users retrieved successfully', 200, result.meta);
});

// Deactivates a user account and revokes all their sessions — PM only
export const deactivateUserAccount = catchAsync(async (req: Request, res: Response) => {
  await deactivateUser(req.params.userId);
  sendNoContent(res);
});