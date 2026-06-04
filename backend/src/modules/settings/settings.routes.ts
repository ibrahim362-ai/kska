import { Router } from 'express';
import * as settingsController from './settings.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.get('/:key', settingsController.getSetting);
router.put('/:key', authorize('ADMIN'), settingsController.updateSetting);
router.put('/', authorize('ADMIN'), settingsController.updateSettings);

export default router;
