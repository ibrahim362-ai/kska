import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { postQuerySchema } from '../../validations/post';
import { voteQuerySchema } from '../../validations/vote';
import { ticketQuerySchema } from '../../validations/ticket';
import * as postController from '../post/post.controller';
import * as voteController from '../vote/vote.controller';
import * as ticketController from '../ticket/ticket.controller';
import * as employerService from './employer.service';
import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse';

const router = Router();
router.use(authenticate);
router.use(authorize('EMPLOYER', 'ADMIN'));

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await employerService.getDashboard(req.user!.userId);
    sendSuccess({ res, data: stats });
  } catch (error) { next(error); }
});

router.get('/posts', validate(postQuerySchema, 'query'), postController.getPosts);
router.post('/posts', postController.createPost);
router.put('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deletePost);

router.get('/votes', validate(voteQuerySchema, 'query'), voteController.getVotes);
router.post('/votes', voteController.createVote);
router.put('/votes/:id', voteController.updateVote);
router.delete('/votes/:id', voteController.deleteVote);

router.get('/tickets', validate(ticketQuerySchema, 'query'), ticketController.getTickets);
router.post('/tickets', ticketController.createTicket);
router.put('/tickets/:id', ticketController.updateTicket);
router.delete('/tickets/:id', ticketController.deleteTicket);
router.get('/tickets/check-ins', ticketController.getMyCheckIns);
router.post('/tickets/check-in', ticketController.checkInTicket);

router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await employerService.getAnalytics(req.user!.userId);
    sendSuccess({ res, data: analytics });
  } catch (error) { next(error); }
});

export default router;
