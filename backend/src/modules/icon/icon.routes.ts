import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import * as iconController from './icon.controller';

const router = Router();

// User routes
router.get('/me', authenticate, iconController.getMyIcons);
router.get('/me/transactions', authenticate, iconController.getMyIconTransactions);
router.get('/leaderboard', iconController.getIconLeaderboard);
router.get('/:userId', iconController.getUserIcons);

// Admin routes
router.post('/award', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), iconController.awardIconsManually);
router.post('/deduct', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), iconController.deductIconsManually);

export default router;
