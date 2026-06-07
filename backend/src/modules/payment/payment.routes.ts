import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';

const router = Router();

// Callbacks disabled (Chapa/Telebirr not in use - manual payment only)
// router.post('/chapa/callback', paymentController.chapaCallback);
// router.post('/telebirr/callback', paymentController.telebirrCallback);

router.use(authenticate);

router.post('/', paymentController.createPayment);
router.put('/:id/confirm', authorize('ADMIN'), paymentController.confirmPayment);
router.get('/', authorize('ADMIN'), paymentController.getPayments);
router.get('/my-payments', paymentController.getUserPayments);

// Chapa & Telebirr automatic payments disabled - use manual payment flow
// router.post('/chapa/initialize', paymentController.chapaInitialize);
// router.get('/chapa/verify/:txRef', paymentController.chapaVerify);

// router.post('/telebirr/initialize', paymentController.telebirrInitialize);
// router.get('/telebirr/query/:txId', paymentController.telebirrQuery);

export default router;
