import { Router } from 'express';
import {
  listNotifications,
  unreadCount,
  markOneAsRead,
  markAllRead,
  removeNotification,
} from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.patch('/mark-all-read', markAllRead);
router.patch('/:notificationId/read', markOneAsRead);
router.delete('/:notificationId', removeNotification);

export default router;