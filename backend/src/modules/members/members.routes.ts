import { Router } from 'express';
import { listMembers, addMember, updateRole, removeMember } from './members.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorizeSystem } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { SYSTEM_ROLES } from '../../constants/roles';
import { addMemberSchema, updateMemberRoleSchema } from './members.schema';

// All member routes are nested under /projects/:projectId/members
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listMembers);
router.post('/', authorizeSystem(SYSTEM_ROLES.ADMIN), validateBody(addMemberSchema), addMember);
router.patch('/:memberId/role', authorizeSystem(SYSTEM_ROLES.ADMIN), validateBody(updateMemberRoleSchema), updateRole);
router.delete('/:memberId', authorizeSystem(SYSTEM_ROLES.ADMIN), removeMember);

export default router;