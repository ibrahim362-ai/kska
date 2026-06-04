import { Router } from 'express';
import * as voteController from './vote.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { createVoteSchema, castVoteSchema, voteQuerySchema } from '../../validations/vote';

const router = Router();

router.get('/', optionalAuth, validate(voteQuerySchema, 'query'), voteController.getVotes);
router.get('/analytics', authenticate, authorize('ADMIN'), voteController.getVoteAnalytics);
router.get('/:id', optionalAuth, voteController.getVoteById);
router.get('/:id/results', optionalAuth, voteController.getVoteResults);

router.post('/', authenticate, validate(createVoteSchema), voteController.createVote);
router.post('/:id/cast', authenticate, validate(castVoteSchema), voteController.castVote);
router.put('/:id', authenticate, voteController.updateVote);
router.delete('/:id', authenticate, voteController.deleteVote);

export default router;
