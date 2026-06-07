import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as membershipService from './membership.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function createPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await membershipService.createPlan(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Membership plan created', data: plan });
  } catch (error) {
    next(error);
  }
}

export async function getPlans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plans = await membershipService.getPlans();
    sendSuccess({ res, data: plans });
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await membershipService.updatePlan(String(req.params.id), req.body);
    sendSuccess({ res, message: 'Plan updated', data: plan });
  } catch (error) {
    next(error);
  }
}

export async function purchaseMembership(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await membershipService.purchaseMembership(req.user!.userId, req.body);
    sendSuccess({ res, statusCode: 201, message: 'Membership purchased', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUserMemberships(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberships = await membershipService.getUserMemberships(req.user!.userId);
    sendSuccess({ res, data: memberships });
  } catch (error) {
    next(error);
  }
}

export async function getAllUserMemberships(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await membershipService.getAllUserMemberships(req.query as any);
    sendSuccess({ res, data: result.data });
  } catch (error) {
    next(error);
  }
}
