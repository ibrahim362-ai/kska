import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function getUserNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.getUserNotifications(req.user!.userId, req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await notificationService.markAsRead(String(req.params.id));
    sendSuccess({ res, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    sendSuccess({ res, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    sendSuccess({ res, data: { count } });
  } catch (error) {
    next(error);
  }
}

export async function createNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await notificationService.createNotification(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Notification sent', data: notification });
  } catch (error) {
    next(error);
  }
}
