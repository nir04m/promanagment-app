import { Router } from 'express';
import { projectReport, myReport } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

// Personal report — any authenticated user
router.get('/me', myReport);

// Full project report — PM only, enforced in the service layer
router.get('/projects/:projectId', projectReport);

export default router;