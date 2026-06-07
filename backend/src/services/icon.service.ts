import prisma from '../config/prisma';

export class IconService {
  /**
   * Award icons to a user and create transaction record
   */
  static async awardIcons(
    userId: string,
    amount: number,
    type: string,
    description: string,
    metadata?: any
  ): Promise<{ newBalance: number; transaction: any }> {
    // Update user's icon balance and create transaction in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user's icons
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          icons: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.iconTransaction.create({
        data: {
          userId,
          amount,
          type,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return { user, transaction };
    });

    return {
      newBalance: result.user.icons,
      transaction: result.transaction,
    };
  }

  /**
   * Deduct icons from a user
   */
  static async deductIcons(
    userId: string,
    amount: number,
    type: string,
    description: string,
    metadata?: any
  ): Promise<{ newBalance: number; transaction: any }> {
    // Check if user has enough icons
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { icons: true },
    });

    if (!user || user.icons < amount) {
      throw new Error('Insufficient icons');
    }

    return this.awardIcons(userId, -amount, type, description, metadata);
  }

  /**
   * Get user's icon balance
   */
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { icons: true },
    });

    return user?.icons || 0;
  }

  /**
   * Get user's icon transaction history
   */
  static async getTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
    }
  ) {
    const { limit = 50, offset = 0, type } = options || {};

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.iconTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.iconTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get leaderboard based on icons
   */
  static async getLeaderboard(options?: { limit?: number; period?: string }) {
    const { limit = 10, period } = options || {};

    let where: any = {};
    
    // Filter by time period if specified
    if (period === 'WEEKLY') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      where.createdAt = { gte: oneWeekAgo };
    } else if (period === 'MONTHLY') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      where.createdAt = { gte: oneMonthAgo };
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        isBanned: false,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        icons: true,
      },
      orderBy: {
        icons: 'desc',
      },
      take: limit,
    });

    return users.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  }
}
