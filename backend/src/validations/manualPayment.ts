import { z } from 'zod';

export const submitManualProofSchema = z.object({
  senderName: z.string().min(2).max(100),
  senderPhone: z.string().regex(/^\+?[0-9]{9,15}$/).optional().nullable(),
  transactionRef: z.string().max(100).optional().nullable(),
  paidAt: z.string().datetime().or(z.date()),
  notes: z.string().max(500).optional().nullable(),
});

export const reviewManualProofSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

export const manualProofQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createManualPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('ETB'),
  metadata: z.string().optional(),
  // Metadata encodes: { type: 'MEMBERSHIP' | 'TICKET', targetId: string, targetName: string }
});
