import { Router } from 'express';
import * as manualPaymentController from './manualPayment.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { uploadLimiter, adminLimiter } from '../../middleware/rateLimit';
import {
  submitManualProofSchema,
  reviewManualProofSchema,
  manualProofQuerySchema,
} from '../../validations/manualPayment';

const router = Router();

/**
 * @openapi
 * /api/manual-payments/instructions:
 *   get:
 *     tags: [Payments]
 *     summary: Get manual payment bank account details (public)
 *     description: Returns the bank accounts users can pay to (CBE, Telebirr, Awash, etc.) plus instructions.
 *     responses:
 *       200: { description: Payment instructions }
 */
router.get('/instructions', manualPaymentController.getPaymentInstructions);

/**
 * @openapi
 * /api/manual-payments/{paymentId}/proof:
 *   post:
 *     tags: [Payments]
 *     summary: Submit proof of payment (receipt upload)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receipt: { type: string, format: binary }
 *               senderName: { type: string }
 *               senderPhone: { type: string }
 *               transactionRef: { type: string }
 *               paidAt: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Proof submitted, awaiting review }
 *       400: { description: Validation error or no file }
 *       404: { description: Payment not found }
 */
router.post(
  '/:paymentId/proof',
  authenticate,
  upload.single('receipt'),
  manualPaymentController.submitProof
);

// Authenticated: submit proof (multipart with file)
router.post(
  '/:paymentId/proof',
  authenticate,
  upload.single('receipt'),
  manualPaymentController.submitProof
);

/**
 * @openapi
 * /api/manual-payments/proofs/my:
 *   get:
 *     tags: [Payments]
 *     summary: Get current user's payment proofs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of user's proofs }
 */
router.get('/proofs/my', authenticate, manualPaymentController.listMyProofs);

/**
 * @openapi
 * /api/manual-payments/proofs:
 *   get:
 *     tags: [Payments]
 *     summary: Admin: list all manual payment proofs
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of proofs }
 */
router.get(
  '/proofs',
  authenticate,
  authorize('ADMIN'),
  validate(manualProofQuerySchema, 'query'),
  manualPaymentController.listProofs
);

router.get(
  '/proofs/:proofId',
  authenticate,
  authorize('ADMIN'),
  manualPaymentController.getProof
);

/**
 * @openapi
 * /api/manual-payments/proofs/{proofId}/review:
 *   put:
 *     tags: [Payments]
 *     summary: Admin: approve or reject a payment proof
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: proofId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [APPROVED, REJECTED] }
 *               rejectionReason: { type: string }
 *     responses:
 *       200: { description: Proof reviewed }
 *       400: { description: Validation error or proof already reviewed }
 *       404: { description: Proof not found }
 */
router.put(
  '/proofs/:proofId/review',
  authenticate,
  authorize('ADMIN'),
  adminLimiter,
  validate(reviewManualProofSchema),
  manualPaymentController.reviewProof
);

export default router;
