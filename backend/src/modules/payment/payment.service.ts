import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export async function createPayment(userId: string, data: {
  amount: number;
  currency?: string;
  method?: string;
  metadata?: string;
}) {
  const reference = `PAY-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: data.amount,
      currency: data.currency || 'ETB',
      method: data.method || 'MANUAL',
      reference,
      metadata: data.metadata,
    },
  });

  return payment;
}

export async function confirmPayment(id: string, data: { transactionId?: string; status: string }) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.status !== 'PENDING') throw new BadRequestError('Payment already processed');

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: data.status,
      transactionId: data.transactionId,
    },
  });

  return updated;
}

export async function getPayments(query: { page: any; limit: any; status?: string }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const where: any = {};
  if (query.status) where.status = query.status;

  const total = await prisma.payment.count({ where });
  const data = await prisma.payment.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserPayments(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
