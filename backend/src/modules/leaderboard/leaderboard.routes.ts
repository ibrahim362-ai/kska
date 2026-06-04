import { Router } from 'express';
import * as leaderboardController from './leaderboard.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';

const router = Router();

router.get('/', authenticate, leaderboardController.getLeaderboard);
router.post('/recalculate', authenticate, authorize('ADMIN'), leaderboardController.recalculateLeaderboard);

export default router;
