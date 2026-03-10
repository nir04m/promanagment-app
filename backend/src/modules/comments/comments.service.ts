import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { Request } from 'express';
import { CommentResponse } from './comments.types';
import { CreateCommentInput, UpdateCommentInput } from './comments.schema';

// Formats a raw Prisma comment into the client-safe CommentResponse shape
function formatComment(comment: {
  id: string;
  content: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; email: string; avatarUrl: string | null };
}): CommentResponse {
  return {
    id: comment.id,
    content: comment.content,
    taskId: comment.taskId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
  };
}

// Verifies the user is a member of the project the task belongs to
async function verifyTaskAccess(taskId: string, userId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new AppError('Task not found', HTTP_STATUS.NOT_FOUND);
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: task.projectId } },
  });

  if (!membership) {
    throw new AppError('You do not have access to this task', HTTP_STATUS.FORBIDDEN);
  }
}

// Returns all comments for a task ordered from oldest to newest
export async function getTaskComments(
  taskId: string,
  userId: string
): Promise<CommentResponse[]> {
  await verifyTaskAccess(taskId, userId);

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map(formatComment);
}

// Creates a new comment on a task — any project member can comment
export async function createComment(
  taskId: string,
  input: CreateCommentInput,
  authorId: string,
  _req: Request
): Promise<CommentResponse> {
  await verifyTaskAccess(taskId, authorId);

  const comment = await prisma.comment.create({
    data: {
      content: input.content,
      taskId,
      authorId,
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return formatComment(comment);
}

// Updates a comment — only the comment author can edit their own comment
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput,
  userId: string
): Promise<CommentResponse> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  if (!comment) {
    throw new AppError('Comment not found', HTTP_STATUS.NOT_FOUND);
  }

  if (comment.authorId !== userId) {
    throw new AppError('You can only edit your own comments', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: input.content },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return formatComment(updated);
}

// Deletes a comment — author or PM can delete
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, taskId: true },
  });

  if (!comment) {
    throw new AppError('Comment not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check if user is author or PM of the project
  const task = await prisma.task.findUnique({
    where: { id: comment.taskId },
    select: { projectId: true },
  });

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId: task!.projectId },
    },
  });

  const isAuthor = comment.authorId === userId;
  const isPM = membership?.projectRole === 'PM';

  if (!isAuthor && !isPM) {
    throw new AppError('You do not have permission to delete this comment', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.comment.delete({ where: { id: commentId } });
}