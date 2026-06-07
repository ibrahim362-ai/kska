import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.getUsers(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(String(req.params.id));
    sendSuccess({ res, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    sendSuccess({ res, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserByAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserByAdmin(String(req.params.id), req.body);
    sendSuccess({ res, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
}

export async function banUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.banUser(String(req.params.id), req.body);
    sendSuccess({ res, message: `User ${req.body.isBanned ? 'banned' : 'unbanned'}`, data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(String(req.params.id));
    sendSuccess({ res, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await userService.getDashboardStats();
    sendSuccess({ res, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.resetUserPassword(String(req.params.id));
    sendSuccess({ res, message: 'Password reset', data: result });
  } catch (error) {
    next(error);
  }
}

export async function registerFcmToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.registerFcmToken(req.user!.userId, req.body.token);
    sendSuccess({ res, message: 'FCM token registered', data: result });
  } catch (error) {
    next(error);
  }
}

export async function unregisterFcmToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.unregisterFcmToken(req.user!.userId, req.body.token);
    sendSuccess({ res, message: 'FCM token unregistered', data: result });
  } catch (error) {
    next(error);
  }
}

export async function addPointsToUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount, reason } = req.body;
    const userId = String(req.params.id);
    const adminId = req.user!.userId;

    if (!amount || !reason) {
      return res.status(400).json({ error: 'Amount and reason are required' });
    }

    const result = await userService.addPointsToUser({
      userId,
      amount: parseInt(amount),
      reason,
      adminId,
    });

    sendSuccess({ res, message: 'Points added successfully', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUserTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = String(req.params.id);
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 100;

    const transactions = await userService.getUserTransactions(userId, limit);
    sendSuccess({ res, data: transactions });
  } catch (error) {
    next(error);
  }
}
