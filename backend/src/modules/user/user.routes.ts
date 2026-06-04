import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, userQuerySchema, banUserSchema } from '../../validations/user';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), validate(userQuerySchema, 'query'), userController.getUsers);
router.get('/stats', authorize('ADMIN'), userController.getDashboardStats);
router.get('/:id', userController.getUserById);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/fcm-token', userController.registerFcmToken);
router.delete('/fcm-token', userController.unregisterFcmToken);
router.put('/:id', authorize('ADMIN'), userController.updateUserByAdmin);
router.put('/:id/ban', authorize('ADMIN'), validate(banUserSchema), userController.banUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);
router.post('/:id/reset-password', authorize('ADMIN'), userController.resetUserPassword);

export default router;
