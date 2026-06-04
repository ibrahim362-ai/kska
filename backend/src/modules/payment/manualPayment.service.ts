import prisma from '../../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export interface ManualPaymentMetadata {
  type: 'MEMBERSHIP' | 'TICKET' | 'OTHER';
  targetId?: string;
  targetName?: string;
  notes?: string;
}

/**
 * User submits proof of payment (receipt image + details) for a pending Payment.
 * Links the proof to the Payment, and updates the Payment status to AWAITING_REVIEW.
 */
export async function submitManualProof(opts: {
  paymentId: string;
  userId: string;
  receiptUrl: string;
  receiptPublicId?: string;
  senderName: string;
  senderPhone?: string | null;
  transactionRef?: string | null;
  paidAt: Date;
  notes?: string | null;
}) {
  const payment = await prisma.payment.findUnique({ where: { id: opts.paymentId } });
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.userId !== opts.userId) throw new ForbiddenError('Not your payment');
  if (payment.status !== 'PENDING') {
    throw new BadRequestError(`Payment is ${payment.status}, cannot submit proof`);
  }

  // Check no existing proof
  const existing = await prisma.manualPaymentProof.findUnique({
    where: { paymentId: opts.paymentId },
  });
  if (existing) {
    throw new BadRequestError('Proof already submitted for this payment');
  }

  const proof = await prisma.manualPaymentProof.create({
    data: {
      paymentId: opts.paymentId,
      userId: opts.userId,
      receiptUrl: opts.receiptUrl,
      receiptPublicId: opts.receiptPublicId,
      senderName: opts.senderName,
      senderPhone: opts.senderPhone,
      transactionRef: opts.transactionRef,
      paidAt: new Date(opts.paidAt),
      notes: opts.notes,
      status: 'PENDING',
    },
    include: {
      payment: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  });

  logger.info('Manual payment proof submitted', {
    paymentId: opts.paymentId,
    userId: opts.userId,
    amount: payment.amount,
  });

  return proof;
}

/**
 * Admin reviews a manual payment proof.
 * On APPROVED: marks Payment as COMPLETED, and activates the related membership/ticket
 * On REJECTED: marks Payment as REJECTED (proof kept for audit)
 */
export async function reviewManualProof(opts: {
  proofId: string;
  reviewerId: string;
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}) {
  const proof = await prisma.manualPaymentProof.findUnique({
    where: { id: opts.proofId },
    include: { payment: true },
  });

  if (!proof) throw new NotFoundError('Payment proof not found');
  if (proof.status !== 'PENDING') {
    throw new BadRequestError(`Proof is already ${proof.status}`);
  }

  if (opts.decision === 'REJECTED' && !opts.rejectionReason) {
    throw new BadRequestError('Rejection reason is required');
  }

  // Atomic: update proof, update payment, side-effects
  const result = await prisma.$transaction(async (tx) => {
    const updatedProof = await tx.manualPaymentProof.update({
      where: { id: opts.proofId },
      data: {
        status: opts.decision,
        reviewedBy: opts.reviewerId,
        reviewedAt: new Date(),
        rejectionReason: opts.decision === 'REJECTED' ? opts.rejectionReason : null,
      },
    });

    const newPaymentStatus = opts.decision === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
    const updatedPayment = await tx.payment.update({
      where: { id: proof.paymentId },
      data: {
        status: newPaymentStatus,
        transactionId: proof.transactionRef || undefined,
      },
    });

    // Side effects on approval
    if (opts.decision === 'APPROVED') {
      await activateTarget(tx, proof.payment);
    }

    return { proof: updatedProof, payment: updatedPayment };
  });

  logger.info('Manual payment proof reviewed', {
    proofId: opts.proofId,
    decision: opts.decision,
    reviewerId: opts.reviewerId,
  });

  return result;
}

/**
 * Activate the membership or ticket linked to this payment via metadata.
 */
async function activateTarget(tx: any, payment: any) {
  let metadata: ManualPaymentMetadata | null = null;
  try {
    metadata = payment.metadata ? JSON.parse(payment.metadata) : null;
  } catch {
    return;
  }

  if (!metadata?.type) return;

  if (metadata.type === 'MEMBERSHIP' && metadata.targetId) {
    const membership = await tx.membership.findUnique({ where: { id: metadata.targetId } });
    if (!membership) return;

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + membership.duration * 24 * 60 * 60 * 1000);

    await tx.userMembership.upsert({
      where: { id: `um-${payment.userId}-${membership.id}` },
      create: {
        userId: payment.userId,
        membershipId: membership.id,
        startsAt,
        expiresAt,
        isActive: true,
      },
      update: {
        startsAt,
        expiresAt,
        isActive: true,
      },
    });

    // Create notification
    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: 'MEMBERSHIP_ACTIVATED',
        title: 'Membership Activated',
        message: `Your ${membership.name} membership is now active.`,
      },
    });
  } else if (metadata.type === 'TICKET' && metadata.targetId) {
    const ticket = await tx.ticket.findUnique({ where: { id: metadata.targetId } });
    if (!ticket) return;

    // Create TicketPurchase
    const purchase = await tx.ticketPurchase.create({
      data: {
        ticketId: ticket.id,
        userId: payment.userId,
        status: 'CONFIRMED',
        paidAmount: payment.amount,
        paymentId: payment.id,
      },
    });

    // Increment sold count
    await tx.ticket.update({
      where: { id: ticket.id },
      data: { soldCount: { increment: 1 } },
    });

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: 'TICKET_PURCHASED',
        title: 'Ticket Confirmed',
        message: `Your ticket for "${ticket.title}" is confirmed.`,
      },
    });
  }
}

export async function getManualProofs(query: {
  status?: string;
  page: number;
  limit: number;
}) {
  const where: any = {};
  if (query.status) where.status = query.status;

  const total = await prisma.manualPaymentProof.count({ where });
  const data = await prisma.manualPaymentProof.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { createdAt: 'desc' },
    include: {
      payment: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
    },
  });

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getMyManualProofs(userId: string) {
  return prisma.manualPaymentProof.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { payment: true },
  });
}

export async function getManualProofById(proofId: string) {
  const proof = await prisma.manualPaymentProof.findUnique({
    where: { id: proofId },
    include: {
      payment: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
    },
  });
  if (!proof) throw new NotFoundError('Payment proof not found');
  return proof;
}
