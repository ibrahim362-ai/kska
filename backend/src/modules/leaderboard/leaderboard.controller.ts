import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as leaderboardService from './leaderboard.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await leaderboardService.getLeaderboard(req.query as any);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
}

export async function recalculateLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await leaderboardService.recalculateLeaderboard();
    sendSuccess({ res, message: 'Leaderboard recalculated', data: result });
  } catch (error) {
    next(error);
  }
}
