import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { NotificationResponse } from './notifications.types';
import { Prisma } from '@prisma/client';

// Formats a raw Prisma notification into the client-safe NotificationResponse shape
function formatNotification(n: {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: unknown;
  isRead: boolean;
  createdAt: Date;
}): NotificationResponse {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    payload: n.payload,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
}

// Returns all notifications for the authenticated user ordered by newest first
export async function getUserNotifications(
  userId: string
): Promise<NotificationResponse[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications.map(formatNotification);
}

// Returns the count of unread notifications for the authenticated user
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

// Marks a single notification as read — only the owner can mark their own
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<NotificationResponse> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }

  if (notification.userId !== userId) {
    throw new AppError('You cannot mark another user\'s notification as read', HTTP_STATUS.FORBIDDEN);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return formatNotification(updated);
}

// Marks all notifications as read for the authenticated user
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

// Deletes a single notification — owner only
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
  }

  if (notification.userId !== userId) {
    throw new AppError('You cannot delete another user\'s notification', HTTP_STATUS.FORBIDDEN);
  }

  await prisma.notification.delete({ where: { id: notificationId } });
}

// Creates a notification for a user — called internally by other services
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type as never,
      title: params.title,
      message: params.message,
      payload: params.payload
        ? (params.payload as Prisma.InputJsonValue)
        : undefined,
    },
  });
}