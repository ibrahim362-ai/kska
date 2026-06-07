import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as manualPaymentService from './manualPayment.service';
import { sendSuccess } from '../../utils/apiResponse';
import { config } from '../../config';
import { uploadFile } from '../upload/upload.service';
import { NotFoundError } from '../../utils/errors';
import { queueEmail } from '../../jobs/email.job';
import prisma from '../../config/prisma';

/**
 * Get the public manual payment instructions (bank accounts, etc.).
 * Public endpoint - no auth required so the mobile app can show it before login.
 */
export async function getPaymentInstructions(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    sendSuccess({
      res,
      data: {
        instructions: config.manualPayment.instructions,
        accounts: {
          bank: {
            bankName: config.manualPayment.bankName,
            accountNumber: config.manualPayment.accountNumber,
            accountHolder: config.manualPayment.accountHolder,
          },
          telebirr: {
            number: config.manualPayment.telebirrNumber,
          },
          awash: {
            accountNumber: config.manualPayment.awashAccount,
            accountHolder: config.manualPayment.accountHolder,
          },
        },
        currency: 'ETB',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * User submits proof of payment (multipart: receipt file + body fields).
 */
export async function submitProof(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new NotFoundError('Receipt file is required');

    const uploadResult = await uploadFile(req.file);

    const proof = await manualPaymentService.submitManualProof({
      paymentId: String(req.params.paymentId),
      userId: req.user!.userId,
      receiptUrl: uploadResult.url,
      receiptPublicId: uploadResult.publicId,
      senderName: req.body.senderName,
      senderPhone: req.body.senderPhone || null,
      transactionRef: req.body.transactionRef || null,
      paidAt: req.body.paidAt,
      notes: req.body.notes || null,
    });

    sendSuccess({
      res,
      statusCode: 201,
      message: 'Proof submitted. Awaiting admin review.',
      data: proof,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin reviews (approves/rejects) a manual payment proof.
 */
export async function reviewProof(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await manualPaymentService.reviewManualProof({
      proofId: String(req.params.proofId),
      reviewerId: req.user!.userId,
      decision: req.body.decision,
      rejectionReason: req.body.rejectionReason,
    });

    // Notify user via email
    try {
      // Get user information from the proof
      const userInfo = await prisma.user.findUnique({
        where: { id: result.proof.userId },
        select: { email: true }
      });

      const html = result.proof.status === 'APPROVED'
        ? `<p>Your payment of ${result.payment.amount} ${result.payment.currency} has been <strong>approved</strong>. Your membership/ticket is now active.</p>`
        : `<p>Your payment of ${result.payment.amount} ${result.payment.currency} has been <strong>rejected</strong>. Reason: ${req.body.rejectionReason}</p>`;

      await queueEmail({
        to: userInfo?.email || '',
        subject: `Payment ${result.proof.status === 'APPROVED' ? 'Approved' : 'Rejected'} - KSKA`,
        html,
      });
    } catch (err) {
      // Don't fail the request if email fails
    }

    sendSuccess({
      res,
      message: `Payment ${result.proof.status === 'APPROVED' ? 'approved' : 'rejected'}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin lists all manual payment proofs (filterable by status).
 */
export async function listProofs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await manualPaymentService.getManualProofs(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

/**
 * User lists their own manual payment proofs.
 */
export async function listMyProofs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const proofs = await manualPaymentService.getMyManualProofs(req.user!.userId);
    sendSuccess({ res, data: proofs });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single proof by ID.
 */
export async function getProof(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const proof = await manualPaymentService.getManualProofById(String(req.params.proofId));
    sendSuccess({ res, data: proof });
  } catch (error) {
    next(error);
  }
}
