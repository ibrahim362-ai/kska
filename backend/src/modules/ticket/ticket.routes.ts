import { Router } from 'express';
import * as ticketController from './ticket.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { createTicketSchema, updateTicketSchema, purchaseTicketSchema, checkInTicketSchema, ticketQuerySchema } from '../../validations/ticket';

const router = Router();

router.get('/', authenticate, validate(ticketQuerySchema, 'query'), ticketController.getTickets);
router.get('/analytics', authenticate, authorize('ADMIN'), ticketController.getTicketAnalytics);
router.get('/my-purchases', authenticate, ticketController.getUserPurchases);
router.get('/check-ins', authenticate, ticketController.getMyCheckIns);
router.get('/refunds/list', authenticate, authorize('ADMIN'), ticketController.getRefunds);
router.get('/transfers/list', authenticate, ticketController.getTransfers);

router.post('/', authenticate, validate(createTicketSchema), ticketController.createTicket);

router.get('/:id', authenticate, ticketController.getTicketById);
router.put('/:id', authenticate, validate(updateTicketSchema), ticketController.updateTicket);
router.delete('/:id', authenticate, ticketController.deleteTicket);

router.post('/purchase', authenticate, validate(purchaseTicketSchema), ticketController.purchaseTicket);
router.post('/check-in', authenticate, validate(checkInTicketSchema), ticketController.checkInTicket);

router.get('/:id/pdf', authenticate, ticketController.getPdfTicket);
router.post('/:id/refund', authenticate, ticketController.requestRefund);
router.put('/:id/refund', authenticate, authorize('ADMIN'), ticketController.processRefund);
router.post('/:id/transfer', authenticate, ticketController.transferTicket);

export default router;
