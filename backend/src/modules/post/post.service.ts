import prisma from '../../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

export async function createPost(userId: string, data: { type?: string; title?: string; content?: string; hashtags?: string; mediaUrl?: string }) {
  const post = await prisma.post.create({
    data: {
      userId,
      type: data.type || 'TEXT',
      title: data.title,
      content: data.content,
      hashtags: data.hashtags,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaUrl?.match(/\.(mp4|webm)$/i) ? 'VIDEO' : data.mediaUrl ? 'IMAGE' : undefined,
    },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return post;
}

export async function getPosts(query: {
  page: number;
  limit: number;
  type?: string;
  userId?: string;
  search?: string;
  sortBy: string;
  sortOrder: string;
}) {
  const where: any = {};
  if (query.type) where.type = query.type;
  if (query.userId) where.userId = query.userId;
  if (query.search) {
    where.OR = [
      { content: { contains: query.search } },
      { hashtags: { contains: query.search } },
    ];
  }

  const total = await prisma.post.count({ where });
  const posts = await prisma.post.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { [query.sortBy === 'likes' ? 'createdAt' : query.sortBy]: query.sortOrder },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return {
    data: posts,
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!post) throw new NotFoundError('Post not found');

  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return post;
}

export async function updatePost(id: string, userId: string, data: any) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundError('Post not found');
  if (post.userId !== userId) throw new ForbiddenError('Not authorized');

  return prisma.post.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
    },
  });
}

export async function deletePost(id: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundError('Post not found');
  if (post.userId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenError('Not authorized');
    }
  }
  await prisma.post.delete({ where: { id } });
}

export async function likePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false, message: 'Post unliked' };
  }

  await prisma.like.create({ data: { userId, postId } });
  return { liked: true, message: 'Post liked' };
}

export async function addComment(userId: string, postId: string, data: { content: string; parentId?: string }) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.postId !== postId) throw new BadRequestError('Invalid parent comment');
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      postId,
      content: data.content,
      parentId: data.parentId,
    },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
    },
  });

  return comment;
}

export async function getComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      replies: {
        include: {
          user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
        },
      },
    },
  });
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('Comment not found');
  if (comment.userId !== userId) throw new ForbiddenError('Not authorized');
  await prisma.comment.delete({ where: { id: commentId } });
}

export async function reportPost(reporterId: string, postId: string, reason: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  return prisma.report.create({
    data: { reporterId, postId, reason },
  });
}

export async function getReports(query: { page: any; limit: any }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const total = await prisma.report.count();
  const data = await prisma.report.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, username: true, fullName: true } },
      post: { select: { id: true, content: true } },
    },
  });
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateReportStatus(id: string, status: string) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new NotFoundError('Report not found');
  return prisma.report.update({ where: { id }, data: { status } });
}

export async function savePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post not found');

  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    return { saved: false, message: 'Post unsaved' };
  }

  await prisma.save.create({ data: { userId, postId } });
  return { saved: true, message: 'Post saved' };
}

export async function getSavedPosts(userId: string, query: { page: any; limit: any }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const total = await prisma.save.count({ where: { userId } });
  const saves = await prisma.save.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        include: {
          user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });

  return {
    data: saves.map((s) => s.post),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTrendingPosts(limit: number = 10) {
  const posts = await prisma.post.findMany({
    where: { isTrending: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, username: true, fullName: true, avatar: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts;
}

export async function calculateTrending() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentPosts = await prisma.post.findMany({
    where: { createdAt: { gte: oneDayAgo } },
    include: {
      _count: { select: { likes: true, comments: true } },
    },
  });

  const scoredPosts = recentPosts.map((post) => {
    const score = post._count.likes * 3 + post._count.comments * 2 + post.viewCount;
    return { id: post.id, score };
  });

  scoredPosts.sort((a, b) => b.score - a.score);

  const topPostIds = scoredPosts.slice(0, 10).map((p) => p.id);

  await prisma.post.updateMany({ where: { isTrending: true }, data: { isTrending: false } });

  if (topPostIds.length > 0) {
    await prisma.post.updateMany({
      where: { id: { in: topPostIds } },
      data: { isTrending: true },
    });
  }

  return { trendingCount: topPostIds.length };
}
