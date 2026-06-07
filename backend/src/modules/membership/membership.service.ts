import crypto from 'crypto';
import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export async function createPlan(data: {
  name: string;
  planType: string;
  level: number;
  price: number;
  pointsReward: number;
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

  // Award points for paid memberships
  if (plan.price > 0 && plan.pointsReward > 0) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { icons: { increment: plan.pointsReward } },
      });

      await prisma.iconTransaction.create({
        data: {
          userId,
          amount: plan.pointsReward,
          type: 'MEMBERSHIP_PURCHASE',
          description: `Purchased ${plan.name} membership - reward ${plan.pointsReward} points`,
          metadata: JSON.stringify({ 
            membershipId: plan.id,
            membershipName: plan.name,
            price: plan.price,
          }),
        },
      });
    } catch (error) {
      console.error('Failed to award membership points:', error);
    }
  }

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

export async function getAllUserMemberships(query: { 
  page?: number; 
  limit?: number; 
  planType?: string;
  status?: string;
}) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  
  // Build where clause based on filters
  const where: any = {};
  
  // Filter by plan type
  if (query.planType && query.planType !== 'ALL') {
    where.membership = {
      planType: query.planType,
    };
  }
  
  // Filter by status
  if (query.status && query.status !== 'ALL') {
    if (query.status === 'ACTIVE') {
      where.isActive = true;
      where.expiresAt = { gt: new Date() };
    } else if (query.status === 'EXPIRED') {
      where.OR = [
        { isActive: false },
        { expiresAt: { lte: new Date() } },
      ];
    }
  }
  
  const [total, userMemberships] = await Promise.all([
    prisma.userMembership.count({ where }),
    prisma.userMembership.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { 
            id: true, 
            fullName: true, 
            username: true,
            email: true,
            avatar: true,
            icons: true,
          } 
        },
        membership: true,
      },
    }),
  ]);
  
  return { 
    data: {
      userMemberships,
      pagination: { 
        page, 
        limit, 
        total, 
        totalPages: Math.ceil(total / limit) 
      },
    },
  };
}
