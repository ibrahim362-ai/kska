import prisma from '../../config/prisma';
import { emitLeaderboardUpdate } from '../../socket/socket';

export async function getLeaderboard(query: { category?: any; period?: any; limit?: any }) {
  const limit = Number(query.limit) || 50;

  // Get users sorted by icons (descending)
  const users = await prisma.user.findMany({
    where: {
      role: 'USER', // Only regular users
      isBanned: false,
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      avatar: true,
      role: true,
      icons: true,
      userMemberships: {
        where: {
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: {
          membership: true,
        },
        orderBy: {
          membership: {
            level: 'desc', // Get highest level membership
          },
        },
        take: 1,
      },
    },
    orderBy: {
      icons: 'desc',
    },
  });

  // Filter out FREE users (level 0) and apply leaderboard boost
  const filteredUsers = users
    .filter((user) => {
      const activeMembership = user.userMemberships[0];
      // Only show users with paid memberships (level > 0)
      return activeMembership && activeMembership.membership.level > 0;
    })
    .map((user) => {
      const activeMembership = user.userMemberships[0];
      const boost = activeMembership?.membership.leaderboardBoost || 1.0;
      
      return {
        user,
        // Apply leaderboard boost to score
        boostedScore: Math.floor(user.icons * boost),
      };
    })
    .sort((a, b) => b.boostedScore - a.boostedScore) // Re-sort by boosted score
    .slice(0, limit);

  // Add rank to each user
  return filteredUsers.map((item, index) => ({
    rank: index + 1,
    score: item.boostedScore, // Use boosted score
    user: {
      id: item.user.id,
      email: item.user.email,
      username: item.user.username,
      fullName: item.user.fullName,
      avatar: item.user.avatar,
      role: item.user.role,
    },
  }));
}

export async function recalculateLeaderboard() {
  // Icons-based leaderboard doesn't need recalculation
  // Icons are updated in real-time when users earn them
  const leaderboard = await getLeaderboard({ limit: 50 });

  emitLeaderboardUpdate({
    category: 'GENERAL',
    period: 'ALL_TIME',
    entries: leaderboard,
  });

  return leaderboard;
}

