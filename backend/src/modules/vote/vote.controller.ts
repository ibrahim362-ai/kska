import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as voteService from './vote.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function createVote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vote = await voteService.createVote(req.user!.userId, req.body);
    sendSuccess({ res, statusCode: 201, message: 'Vote created', data: vote });
  } catch (error) {
    next(error);
  }
}

export async function getVotes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await voteService.getVotes(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getVoteById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vote = await voteService.getVoteById(String(req.params.id), req.user?.userId);
    sendSuccess({ res, data: vote });
  } catch (error) {
    next(error);
  }
}

export async function castVote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await voteService.castVote(req.user!.userId, String(req.params.id), req.body.optionId, req.ip || '');
    sendSuccess({ res, message: 'Vote cast successfully', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getVoteResults(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const results = await voteService.getVoteResults(String(req.params.id));
    sendSuccess({ res, data: results });
  } catch (error) {
    next(error);
  }
}

export async function deleteVote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await voteService.deleteVote(String(req.params.id), req.user!.userId);
    sendSuccess({ res, message: 'Vote deleted' });
  } catch (error) {
    next(error);
  }
}

export async function updateVote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vote = await voteService.updateVote(String(req.params.id), req.user!.userId, req.body);
    sendSuccess({ res, message: 'Vote updated', data: vote });
  } catch (error) {
    next(error);
  }
}

export async function getVoteAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const analytics = await voteService.getVoteAnalytics();
    sendSuccess({ res, data: analytics });
  } catch (error) {
    next(error);
  }
}
