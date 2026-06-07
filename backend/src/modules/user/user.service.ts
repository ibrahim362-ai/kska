import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import bcrypt from 'bcryptjs';

export async function getUsers(query: {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  sortBy: string;
  sortOrder: string;
}) {
  const where: any = {};
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search } },
      { email: { contains: query.search } },
      { username: { contains: query.search } },
    ];
  }
  if (query.role) where.role = query.role;

  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { [query.sortBy]: query.sortOrder },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      avatar: true,
      bio: true,
      phone: true,
      role: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
    },
  });

  return {
    data: users,
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      avatar: true,
      bio: true,
      phone: true,
      role: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function updateProfile(userId: string, data: any) {
  // Whitelist allowed fields for self-update
  const allowed: any = {};
  if (data.fullName !== undefined) allowed.fullName = data.fullName;
  if (data.bio !== undefined) allowed.bio = data.bio;
  if (data.phone !== undefined) allowed.phone = data.phone;
  if (data.avatar !== undefined) allowed.avatar = data.avatar;

  if (Object.keys(allowed).length === 0) {
    throw new BadRequestError('No valid fields to update');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: allowed,
    select: { id: true, email: true, username: true, fullName: true, avatar: true, bio: true, phone: true, role: true, isVerified: true, createdAt: true },
  });
  return user;
}

export async function updateUserByAdmin(id: string, data: any) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');

  const updateData: any = {};
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, username: true, fullName: true, role: true, isVerified: true },
  });
}

export async function banUser(id: string, data: { isBanned: boolean; banReason?: string }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');

  return prisma.user.update({
    where: { id },
    data: { isBanned: data.isBanned, banReason: data.banReason || null },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');
  await prisma.user.delete({ where: { id } });
}

export async function getDashboardStats() {
  const [totalUsers, activeUsers, totalPosts, totalVotes, totalTickets, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: false } }),
    prisma.post.count(),
    prisma.vote.count(),
    prisma.ticket.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });

  return {
    totalUsers,
    activeUsers,
    totalPosts,
    totalVotes,
    totalTickets,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentUsers,
  };
}

export async function resetUserPassword(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let newPassword = '';
  for (let i = 0; i < 10; i++) newPassword += chars[Math.floor(Math.random() * chars.length)];

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });

  return { password: newPassword };
}

/**
 * Register an FCM token for push notifications.
 * Stores in user's deviceSessions JSON field (simple, no separate table).
 */
export async function registerFcmToken(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  let sessions: string[] = [];
  try {
    sessions = user.deviceSessions ? JSON.parse(user.deviceSessions) : [];
  } catch {
    sessions = [];
  }

  if (!sessions.includes(token)) {
    sessions.push(token);
    if (sessions.length > 10) sessions = sessions.slice(-10); // Keep only last 10
    await prisma.user.update({
      where: { id: userId },
      data: { deviceSessions: JSON.stringify(sessions) },
    });
  }
  return { success: true };
}

export async function unregisterFcmToken(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  let sessions: string[] = [];
  try {
    sessions = user.deviceSessions ? JSON.parse(user.deviceSessions) : [];
  } catch {
    sessions = [];
  }

  sessions = sessions.filter((t) => t !== token);
  await prisma.user.update({
    where: { id: userId },
    data: { deviceSessions: JSON.stringify(sessions) },
  });
  return { success: true };
}

/**
 * Admin: Manually add points to a user
 */
export async function addPointsToUser(data: {
  userId: string;
  amount: number;
  reason: string;
  adminId: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new NotFoundError('User not found');

  if (data.amount <= 0) {
    throw new BadRequestError('Amount must be greater than 0');
  }

  // Update user icons and create transaction
  const [updatedUser, transaction] = await prisma.$transaction([
    prisma.user.update({
      where: { id: data.userId },
      data: { icons: { increment: data.amount } },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        icons: true,
      },
    }),
    prisma.iconTransaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: 'ADMIN_BONUS',
        description: data.reason,
        metadata: JSON.stringify({ 
          adminId: data.adminId,
          timestamp: new Date().toISOString()
        }),
      },
    }),
  ]);

  return {
    user: updatedUser,
    transaction,
  };
}

/**
 * Get user's icon transactions history
 */
export async function getUserTransactions(userId: string, limit: number = 100) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const transactions = await prisma.iconTransaction.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      amount: true,
      type: true,
      description: true,
      metadata: true,
      createdAt: true,
    },
  });

  return transactions;
}
