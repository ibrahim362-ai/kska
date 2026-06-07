import prisma from '../../config/prisma';

export class ChallengeService {
  // Admin: Create a new challenge
  async createChallenge(data: {
    creatorId: string;
    title: string;
    description: string;
    type?: string;
    imageUrl?: string;
    points?: number;
    startsAt: Date;
    endsAt: Date;
    maxResponses?: number;
  }) {
    return prisma.challenge.create({
      data: {
        ...data,
        type: data.type || 'GENERAL',
        points: data.points || 10,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // Admin: Get all challenges with stats
  async getAllChallenges(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          _count: {
            select: { responses: true },
          },
        },
      }),
      prisma.challenge.count(),
    ]);

    return {
      challenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Update challenge
  async updateChallenge(id: string, data: any) {
    return prisma.challenge.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // Admin: Delete challenge
  async deleteChallenge(id: string) {
    return prisma.challenge.delete({ where: { id } });
  }

  // Admin: Get challenge stats
  async getChallengeStats(id: string) {
    const [challenge, responses] = await Promise.all([
      prisma.challenge.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.challengeResponse.groupBy({
        by: ['action'],
        where: { challengeId: id },
        _count: true,
      }),
    ]);

    const stats = {
      accept: 0,
      reject: 0,
      skip: 0,
    };

    responses.forEach((r) => {
      if (r.action === 'ACCEPT') stats.accept = r._count;
      if (r.action === 'REJECT') stats.reject = r._count;
      if (r.action === 'SKIP') stats.skip = r._count;
    });

    return {
      challenge,
      stats,
      totalResponses: stats.accept + stats.reject + stats.skip,
    };
  }

  // Admin: Get challenge responses with user details
  async getChallengeResponses(id: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      prisma.challengeResponse.findMany({
        where: { challengeId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              avatar: true,
              phone: true,
              icons: true,
            },
          },
        },
      }),
      prisma.challengeResponse.count({ where: { challengeId: id } }),
    ]);

    return {
      responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Get only users who accepted the challenge
  async getChallengeAcceptors(id: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      prisma.challengeResponse.findMany({
        where: { 
          challengeId: id,
          action: 'ACCEPT'
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              avatar: true,
              phone: true,
              icons: true,
            },
          },
        },
      }),
      prisma.challengeResponse.count({ 
        where: { 
          challengeId: id,
          action: 'ACCEPT'
        }
      }),
    ]);

    return {
      responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mobile: Get active challenges for user (challenges they haven't responded to)
  async getActiveChallengesForUser(userId: string) {
    const now = new Date();
    
    // Get challenges user hasn't responded to yet
    const respondedChallengeIds = await prisma.challengeResponse.findMany({
      where: { userId },
      select: { challengeId: true },
    });

    const excludeIds = respondedChallengeIds.map((r) => r.challengeId);

    return prisma.challenge.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        id: { notIn: excludeIds },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // Mobile: Get user's challenge history
  async getUserChallengeHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      prisma.challengeResponse.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          challenge: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      prisma.challengeResponse.count({ where: { userId } }),
    ]);

    return {
      responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mobile: Respond to challenge (ACCEPT, REJECT, SKIP)
  async respondToChallenge(data: {
    challengeId: string;
    userId: string;
    action: 'ACCEPT' | 'REJECT' | 'SKIP';
    content?: string;
    mediaUrl?: string;
  }) {
    // Check if user already responded
    const existing = await prisma.challengeResponse.findUnique({
      where: {
        challengeId_userId: {
          challengeId: data.challengeId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new Error('You have already responded to this challenge');
    }

    // Check if challenge is still active
    const challenge = await prisma.challenge.findUnique({
      where: { id: data.challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const now = new Date();
    if (!challenge.isActive || challenge.startsAt > now || challenge.endsAt < now) {
      throw new Error('Challenge is not active');
    }

    // Check max responses limit
    if (challenge.maxResponses && challenge.totalResponses >= challenge.maxResponses) {
      throw new Error('Challenge has reached maximum responses');
    }

    // Create response and update challenge stats
    const [response] = await prisma.$transaction([
      prisma.challengeResponse.create({
        data: {
          challengeId: data.challengeId,
          userId: data.userId,
          action: data.action,
          content: data.content,
          mediaUrl: data.mediaUrl,
        },
        include: {
          challenge: true,
        },
      }),
      prisma.challenge.update({
        where: { id: data.challengeId },
        data: {
          totalResponses: { increment: 1 },
          acceptCount: data.action === 'ACCEPT' ? { increment: 1 } : undefined,
          rejectCount: data.action === 'REJECT' ? { increment: 1 } : undefined,
          skipCount: data.action === 'SKIP' ? { increment: 1 } : undefined,
        },
      }),
    ]);

    // NOTE: Points are NOT automatically awarded
    // Admin must manually add points via the web admin panel
    // This allows admin to review the response quality before awarding points

    return response;
  }
}

export const challengeService = new ChallengeService();
