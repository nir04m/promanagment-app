import { Router } from 'express';
import multer from 'multer';
import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  getAllUsers,
  deactivateUserAccount,
} from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateQuery } from '../../middleware/validate';
import { ROLES } from '../../constants/roles';
import { listUsersQuerySchema } from './users.schema';

// Stores uploaded files in memory before passing to Backblaze B2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me', upload.single('avatar'), updateProfile);
router.get('/', authorize(ROLES.PM), validateQuery(listUsersQuerySchema), getAllUsers);
router.get('/:userId', getUserProfile);
router.patch('/:userId/deactivate', authorize(ROLES.PM), deactivateUserAccount);

export default router;