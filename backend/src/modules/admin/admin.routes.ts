import { Router } from 'express';
import * as userController from '../user/user.controller';
import * as ticketController from '../ticket/ticket.controller';
import * as auditService from '../audit/audit.service';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { userQuerySchema } from '../../validations/user';
import { ticketQuerySchema } from '../../validations/ticket';
import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', validate(userQuerySchema, 'query'), userController.getUsers);
router.put('/users/:id', userController.updateUserByAdmin);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id/ban', userController.banUser);
router.post('/users/:id/reset-password', userController.resetUserPassword);

router.get('/tickets', validate(ticketQuerySchema, 'query'), ticketController.getTickets);
router.get('/tickets/analytics', ticketController.getTicketAnalytics);
router.put('/tickets/:id/refund', ticketController.processRefund);
router.get('/tickets/refunds', ticketController.getRefunds);

router.get('/audit-logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await auditService.getAuditLogs({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) { next(error); }
});

export default router;
