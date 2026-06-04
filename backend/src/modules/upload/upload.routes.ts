import { Router } from 'express';
import * as uploadController from './upload.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/single', upload.single('file'), uploadController.uploadFile);
router.post('/multiple', upload.array('files', 10), uploadController.uploadFiles);

export default router;
