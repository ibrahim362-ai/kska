import prisma from '../../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../utils/errors';
import { emitVoteUpdate } from '../../socket/socket';

export async function createVote(creatorId: string, data: {
  title: string;
  description?: string;
  voteType: string;
  startsAt: string;
  endsAt: string;
  options: { text: string; imageUrl?: string }[];
  isLive?: boolean;
}) {
  const vote = await prisma.vote.create({
    data: {
      creatorId,
      title: data.title,
      description: data.description,
      voteType: data.voteType,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      isLive: data.isLive !== undefined ? data.isLive : true, // Default to true if not specified
      options: {
        create: data.options.map((opt, idx) => ({
          text: opt.text,
          imageUrl: opt.imageUrl,
          sortOrder: idx,
        })),
      },
    },
    include: {
      options: true,
        creator: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
    },
  });

  return vote;
}

export async function getVotes(query: {
  page: number;
  limit: number;
  isActive?: boolean;
  creatorId?: string;
  sortBy: string;
  sortOrder: string;
  userId?: string; // Add userId parameter
}) {
  const where: any = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.creatorId) where.creatorId = query.creatorId;

  const now = new Date();
  const votes = await prisma.vote.findMany({
    where: {
      ...where,
    },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { [query.sortBy]: query.sortOrder },
    include: {
        creator: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      options: { select: { id: true, text: true, voteCount: true } },
    },
  });

  const total = await prisma.vote.count({ where: { ...where } });

  // For each vote, check if the user has voted
  const votesWithUserStatus = await Promise.all(
    votes.map(async (v) => {
      let hasVoted = false;
      let userVotedOptionId = null;

      if (query.userId) {
        const record = await prisma.voteRecord.findFirst({
          where: { voteId: v.id, userId: query.userId },
          select: { optionId: true },
          orderBy: { createdAt: 'desc' },
        });
        if (record) {
          hasVoted = true;
          userVotedOptionId = record.optionId;
        }
      }

      return {
        ...v,
        isActive: v.isActive && new Date(v.endsAt) > now,
        hasVoted,
        userVotedOptionId,
      };
    })
  );

  return {
    data: votesWithUserStatus,
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getVoteById(id: string, userId?: string) {
  const vote = await prisma.vote.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      options: { orderBy: { sortOrder: 'asc' }, select: { id: true, text: true, imageUrl: true, voteCount: true } },
      _count: { select: { records: true } },
      records: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              fullName: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vote) throw new NotFoundError('Vote not found');

  let userVote = null;
  let hasVoted = false;
  let userVotedOptionId = null;
  
  if (userId) {
    const record = await prisma.voteRecord.findFirst({
      where: { voteId: id, userId },
      select: { optionId: true },
      orderBy: { createdAt: 'desc' },
    });
    if (record) {
      userVote = record.optionId;
      hasVoted = true;
      userVotedOptionId = record.optionId;
    }
  }

  // Map voters to simpler format
  const voters = vote.records.map((record) => ({
    id: record.id,
    user: record.user,
    optionId: record.optionId,
    createdAt: record.createdAt,
  }));

  return { 
    ...vote, 
    userVote, 
    hasVoted,
    userVotedOptionId,
    isActive: vote.isActive && new Date(vote.endsAt) > new Date(),
    totalVotes: vote._count.records,
    voters,
  };
}

export async function castVote(userId: string, voteId: string, optionId: string, ipAddress: string) {
  const vote = await prisma.vote.findUnique({
    where: { id: voteId },
    include: { options: true },
  });

  if (!vote) throw new NotFoundError('Vote not found');
  if (!vote.isActive) throw new BadRequestError('Vote is not active');
  if (new Date(vote.endsAt) < new Date()) throw new BadRequestError('Vote has ended');
  if (new Date(vote.startsAt) > new Date()) throw new BadRequestError('Vote has not started yet');

  const option = vote.options.find((o) => o.id === optionId);
  if (!option) throw new NotFoundError('Option not found');

  const existing = await prisma.voteRecord.findUnique({
    where: { voteId_userId: { voteId, userId } },
  });

  if (existing) {
    const userMembership = await prisma.userMembership.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: { membership: true },
    });

    const extraVotes = userMembership?.membership?.extraVotes || 0;
    if (extraVotes <= 0) throw new ConflictError('You have already voted');

    const userVoteCount = await prisma.voteRecord.count({
      where: { voteId, userId },
    });

    if (userVoteCount >= extraVotes + 1) {
      throw new ConflictError(`You have reached the maximum of ${extraVotes + 1} votes for this vote`);
    }
  }

  const record = await prisma.voteRecord.create({
    data: {
      voteId,
      optionId,
      userId,
      ipAddress,
    },
  });

  await prisma.voteOption.update({
    where: { id: optionId },
    data: { voteCount: { increment: 1 } },
  });

  await prisma.vote.update({
    where: { id: voteId },
    data: { totalVotes: { increment: 1 } },
  });

  const results = await prisma.voteOption.findMany({
    where: { voteId },
    select: { id: true, text: true, voteCount: true },
    orderBy: { sortOrder: 'asc' },
  });

  emitVoteUpdate(voteId, { voteId, results, totalVotes: vote.totalVotes + 1 });

  return { record, results };
}

export async function getVoteResults(voteId: string) {
  const vote = await prisma.vote.findUnique({ where: { id: voteId } });
  if (!vote) throw new NotFoundError('Vote not found');

  const options = await prisma.voteOption.findMany({
    where: { voteId },
    select: { id: true, text: true, imageUrl: true, voteCount: true },
    orderBy: { voteCount: 'desc' },
  });

  const total = options.reduce((sum, o) => sum + o.voteCount, 0);

  return {
    voteId,
    title: vote.title,
    totalVotes: total,
    isActive: vote.isActive && new Date(vote.endsAt) > new Date(),
    endsAt: vote.endsAt,
    options: options.map((o) => ({
      ...o,
      percentage: total > 0 ? Math.round((o.voteCount / total) * 100) : 0,
    })),
  };
}

export async function deleteVote(id: string, userId: string) {
  const vote = await prisma.vote.findUnique({ where: { id } });
  if (!vote) throw new NotFoundError('Vote not found');
  if (vote.creatorId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenError('Not authorized');
    }
  }
  await prisma.vote.delete({ where: { id } });
}

export async function updateVote(id: string, userId: string, data: {
  title?: string;
  description?: string;
  isLive?: boolean;
  isActive?: boolean;
  endsAt?: string;
}) {
  const vote = await prisma.vote.findUnique({ where: { id } });
  if (!vote) throw new NotFoundError('Vote not found');
  if (vote.creatorId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenError('Not authorized');
    }
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isLive !== undefined) updateData.isLive = data.isLive;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);

  return prisma.vote.update({
    where: { id },
    data: updateData,
    include: {
      options: true,
        creator: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
    },
  });
}

export async function getVoteAnalytics() {
  const [totalVotes, activeVotes, totalVoteRecords] = await Promise.all([
    prisma.vote.count(),
    prisma.vote.count({ where: { isActive: true } }),
    prisma.voteRecord.count(),
  ]);

  const topVotes = await prisma.vote.findMany({
    take: 10,
    orderBy: { totalVotes: 'desc' },
    select: { id: true, title: true, totalVotes: true },
  });

  return { totalVotes, activeVotes, totalVoteRecords, topVotes };
}
