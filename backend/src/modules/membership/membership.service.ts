import crypto from 'crypto';
import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export async function createPlan(data: {
  name: string;
  planType: string;
  price: number;
  duration: number;
  badgeIcon?: string;
  extraVotes: number;
  priorityTicket: boolean;
  leaderboardBoost: number;
}) {
  return prisma.membership.create({ data });
}

export async function getPlans() {
  return prisma.membership.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
}

export async function updatePlan(id: string, data: any) {
  const plan = await prisma.membership.findUnique({ where: { id } });
  if (!plan) throw new NotFoundError('Plan not found');
  return prisma.membership.update({ where: { id }, data });
}

export async function purchaseMembership(userId: string, data: { membershipId: string; autoRenew: boolean }) {
  const plan = await prisma.membership.findUnique({ where: { id: data.membershipId } });
  if (!plan) throw new NotFoundError('Plan not found');
  if (!plan.isActive) throw new BadRequestError('Plan is not available');

  const existing = await prisma.userMembership.findFirst({
    where: { userId, isActive: true, expiresAt: { gt: new Date() } },
  });

  if (existing) throw new BadRequestError('You already have an active membership');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.duration);

  const membership = await prisma.userMembership.create({
    data: {
      userId,
      membershipId: plan.id,
      expiresAt,
      autoRenew: data.autoRenew,
    },
    include: { membership: true },
  });

  if (plan.price > 0) {
    const reference = `MEM-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
    await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: 'ETB',
        method: 'MANUAL',
        status: 'PENDING',
        reference,
        metadata: JSON.stringify({ type: 'MEMBERSHIP', userMembershipId: membership.id, membershipId: plan.id }),
      },
    });
  }

  return membership;
}

export async function getUserMemberships(userId: string) {
  return prisma.userMembership.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { membership: true },
  });
}

export async function getAllUserMemberships(query: { page: number; limit: number }) {
  const total = await prisma.userMembership.count();
  const data = await prisma.userMembership.findMany({
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      membership: true,
    },
  });
  return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
