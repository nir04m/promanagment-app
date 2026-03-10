import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from './comments.service';
import { CreateCommentInput, UpdateCommentInput } from './comments.schema';

// Returns all comments for a task
export const listComments = catchAsync(async (req: Request, res: Response) => {
  const comments = await getTaskComments(req.params.taskId, req.user!.id);
  sendSuccess(res, comments, 'Comments retrieved successfully');
});

// Creates a new comment on a task
export const createCommentHandler = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as CreateCommentInput;
  const comment = await createComment(req.params.taskId, input, req.user!.id, req);
  sendCreated(res, comment, 'Comment created successfully');
});

// Updates an existing comment — author only
export const updateCommentHandler = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as UpdateCommentInput;
  const comment = await updateComment(req.params.commentId, input, req.user!.id);
  sendSuccess(res, comment, 'Comment updated successfully');
});

// Deletes a comment — author or PM
export const deleteCommentHandler = catchAsync(async (req: Request, res: Response) => {
  await deleteComment(req.params.commentId, req.user!.id);
  sendNoContent(res);
});