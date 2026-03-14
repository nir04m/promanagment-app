import { Router } from 'express';
import { register, login, refresh, logout, updatePassword, getMe } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

// Public routes — rate limited to prevent brute force
router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/refresh',  validateBody(refreshTokenSchema), refresh);
router.post('/logout', validateBody(refreshTokenSchema), logout);

// Protected routes — require valid access token
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validateBody(changePasswordSchema), updatePassword);

export default router;