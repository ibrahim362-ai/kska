import { z } from 'zod';

export const createPostSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'EVENT', 'ANNOUNCEMENT', 'VOTE_POST']).default('TEXT'),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.string().optional(),
  hashtags: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  hashtags: z.string().optional(),
});

export const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'EVENT', 'ANNOUNCEMENT', 'VOTE_POST']).optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'viewCount', 'likes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: z.string().optional(),
});
