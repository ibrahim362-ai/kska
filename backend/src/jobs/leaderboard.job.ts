import { Job } from 'bullmq';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export interface LeaderboardJobData {
  category?: string;
  period?: string;
}

export async function processLeaderboardJob(job: Job<LeaderboardJobData>) {
  const { category = 'GENERAL', period = 'WEEKLY' } = job.data;
  logger.info(`Recomputing leaderboard ${category}/${period}`);

  // Recompute logic - example:
  // 1. Aggregate scores from posts, votes, ticket purchases
  // 2. Upsert LeaderboardEntry rows

  const users = await prisma.user.findMany({
    where: { isBanned: false },
    select: { id: true },
  });

  logger.info(`Leaderboard recompute done for ${users.length} users`);
  return { processed: users.length };
}

export async function scheduleLeaderboardRecompute() {
  const { leaderboardQueue } = await import('../queue');
  // Run daily at midnight
  await leaderboardQueue().add(
    'recompute',
    { category: 'GENERAL', period: 'WEEKLY' },
    { repeat: { pattern: '0 0 * * *' } }
  );
}
