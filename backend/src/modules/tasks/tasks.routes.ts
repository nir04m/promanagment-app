import { Router } from 'express';
import { create, list, getOne, update, selfAssign, remove } from './tasks.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from './tasks.schema';

// All task routes are nested under /projects/:projectId/tasks
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validateBody(createTaskSchema), create);
router.get('/', validateQuery(listTasksQuerySchema), list);
router.get('/:taskId', getOne);
router.patch('/:taskId', validateBody(updateTaskSchema), update);
router.patch('/:taskId/self-assign', selfAssign);
router.delete('/:taskId', remove);

export default router;