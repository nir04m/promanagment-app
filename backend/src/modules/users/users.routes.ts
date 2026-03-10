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
import { authorizeSystem } from '../../middleware/authorize';
import { validateQuery } from '../../middleware/validate';
import { SYSTEM_ROLES } from '../../constants/roles';
import { listUsersQuerySchema } from './users.schema';

// Stores uploaded files in memory before passing to Backblaze B2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me', upload.single('avatar'), updateProfile);
router.get('/', authorizeSystem(SYSTEM_ROLES.ADMIN), validateQuery(listUsersQuerySchema), getAllUsers);
router.get('/:userId', getUserProfile);
router.patch('/:userId/deactivate', authorizeSystem(SYSTEM_ROLES.ADMIN), deactivateUserAccount);

export default router;