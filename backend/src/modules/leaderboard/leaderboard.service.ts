import prisma from '../../config/prisma';
import { emitLeaderboardUpdate } from '../../socket/socket';

export async function getLeaderboard(query: { category?: any; period?: any; limit?: any }) {
  const period = String(query.period || 'WEEKLY');
  const category = String(query.category || 'GENERAL');
  const limit = Number(query.limit) || 50;

  const entries = await prisma.leaderboardEntry.findMany({
    where: { category, period },
    orderBy: { score: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true },
      },
    },
  });

  return entries.map((entry, index) => ({
    rank: index + 1,
    score: entry.score,
    user: entry.user,
  }));
}

export async function recalculateLeaderboard() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      _count: { select: { posts: true, likes: true, comments: true, voteRecords: true } },
    },
  });

  const periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'];

  for (const user of users) {
    const userMembership = await prisma.userMembership.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: { membership: true },
    });

    const boost = userMembership?.membership?.leaderboardBoost || 1.0;

    const baseScore =
      user._count.posts * 10 +
      user._count.likes * 2 +
      user._count.comments * 3 +
      user._count.voteRecords * 5;

    const score = Math.round(baseScore * boost);

    for (const period of periods) {
      await prisma.leaderboardEntry.upsert({
        where: {
          id: `${user.id}-${period}-GENERAL`,
          userId: user.id,
          category: 'GENERAL',
          period: period,
        },
        create: {
          userId: user.id,
          score,
          category: 'GENERAL',
          period,
        },
        update: { score },
      });
    }
  }

  const leaderboard = await getLeaderboard({ category: 'GENERAL', period: 'WEEKLY' });

  emitLeaderboardUpdate({
    category: 'GENERAL',
    period: 'WEEKLY',
    entries: leaderboard,
  });

  return leaderboard;
}
