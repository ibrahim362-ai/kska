import { Router } from 'express';
import { challengeController } from './challenge.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';

const router = Router();

// Admin routes (must come before generic :id routes to avoid conflicts)
router.get('/admin/all', authenticate, authorize('ADMIN'), challengeController.getAllChallenges.bind(challengeController));
router.post('/', authenticate, authorize('ADMIN'), challengeController.createChallenge.bind(challengeController));

// Mobile/User routes (must come before generic :id routes)
router.get('/active', authenticate, challengeController.getActiveChallenges.bind(challengeController));
router.get('/history', authenticate, challengeController.getUserChallengeHistory.bind(challengeController));

// Admin routes with :id parameter
router.get('/:id/stats', authenticate, authorize('ADMIN'), challengeController.getChallengeStats.bind(challengeController));
router.get('/:id/responses', authenticate, authorize('ADMIN'), challengeController.getChallengeResponses.bind(challengeController));
router.get('/:id/acceptors', authenticate, authorize('ADMIN'), challengeController.getChallengeAcceptors.bind(challengeController));
router.put('/:id', authenticate, authorize('ADMIN'), challengeController.updateChallenge.bind(challengeController));
router.delete('/:id', authenticate, authorize('ADMIN'), challengeController.deleteChallenge.bind(challengeController));

// Admin: Award points to challenge response
router.post('/responses/:responseId/award', authenticate, authorize('ADMIN'), challengeController.awardPoints.bind(challengeController));

// Mobile route with :challengeId parameter
router.post('/:challengeId/respond', authenticate, challengeController.respondToChallenge.bind(challengeController));

export default router;
