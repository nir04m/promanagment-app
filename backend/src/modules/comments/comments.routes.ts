import { Router } from 'express';
import {
  listComments,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from './comments.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { createCommentSchema, updateCommentSchema } from './comments.schema';

// All comment routes are nested under /tasks/:taskId/comments
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listComments);
router.post('/', validateBody(createCommentSchema), createCommentHandler);
router.patch('/:commentId', validateBody(updateCommentSchema), updateCommentHandler);
router.delete('/:commentId', deleteCommentHandler);

export default router;