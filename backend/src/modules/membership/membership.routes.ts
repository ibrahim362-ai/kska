import { Router } from 'express';
import * as membershipController from './membership.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { createMembershipSchema, updateMembershipSchema, purchaseMembershipSchema } from '../../validations/membership';

const router = Router();

router.get('/', membershipController.getPlans);

router.post('/', authenticate, authorize('ADMIN'), validate(createMembershipSchema), membershipController.createPlan);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateMembershipSchema), membershipController.updatePlan);

router.post('/purchase', authenticate, validate(purchaseMembershipSchema), membershipController.purchaseMembership);
router.get('/my-memberships', authenticate, membershipController.getUserMemberships);
router.get('/all-users', authenticate, authorize('ADMIN'), membershipController.getAllUserMemberships);

export default router;
