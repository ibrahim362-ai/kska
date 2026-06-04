import { Router } from 'express';
import * as notificationController from './notification.controller';
import * as fcmService from './fcm.service';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse';

const router = Router();

router.use(authenticate);

router.post('/register-token', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await fcmService.registerToken(req.user!.userId, req.body.fcmToken);
    sendSuccess({ res, message: 'FCM token registered' });
  } catch (error) {
    next(error);
  }
});

router.post('/remove-token', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await fcmService.removeToken(req.user!.userId);
    sendSuccess({ res, message: 'FCM token removed' });
  } catch (error) {
    next(error);
  }
});

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/', authorize('ADMIN', 'EMPLOYER'), notificationController.createNotification);

export default router;
