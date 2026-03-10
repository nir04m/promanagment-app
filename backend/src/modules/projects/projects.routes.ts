import { Router } from 'express';
import { create, list, getOne, update, remove } from './projects.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorizeSystem } from '../../middleware/authorize';
import { validateBody, validateQuery } from '../../middleware/validate';
import { SYSTEM_ROLES } from '../../constants/roles';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from './projects.schema';

const router = Router();

router.use(authenticate);

router.post('/', authorizeSystem(SYSTEM_ROLES.ADMIN), validateBody(createProjectSchema), create);
router.get('/', validateQuery(listProjectsQuerySchema), list);
router.get('/:projectId', getOne);
router.patch('/:projectId', authorizeSystem(SYSTEM_ROLES.ADMIN), validateBody(updateProjectSchema), update);
router.delete('/:projectId', authorizeSystem(SYSTEM_ROLES.ADMIN), remove);

export default router;