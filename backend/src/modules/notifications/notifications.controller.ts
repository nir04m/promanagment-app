import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendNoContent } from '../../utils/apiResponse';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notifications.service';

// Returns all notifications for the authenticated user
export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await getUserNotifications(req.user!.id);
  sendSuccess(res, notifications, 'Notifications retrieved successfully');
});

// Returns the unread notification count for the authenticated user
export const unreadCount = catchAsync(async (req: Request, res: Response) => {
  const count = await getUnreadCount(req.user!.id);
  sendSuccess(res, { count }, 'Unread count retrieved successfully');
});

// Marks a single notification as read
export const markOneAsRead = catchAsync(async (req: Request, res: Response) => {
  const notification = await markAsRead(req.params.notificationId, req.user!.id);
  sendSuccess(res, notification, 'Notification marked as read');
});

// Marks all notifications as read for the authenticated user
export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await markAllAsRead(req.user!.id);
  sendNoContent(res);
});

// Deletes a single notification
export const removeNotification = catchAsync(async (req: Request, res: Response) => {
  await deleteNotification(req.params.notificationId, req.user!.id);
  sendNoContent(res);
});