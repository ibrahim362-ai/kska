import { z } from 'zod';

export const createVoteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  voteType: z.enum(['FREE_VOTE', 'PAID_VOTE', 'PREMIUM_MEMBER_VOTE']).default('FREE_VOTE'),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  options: z.array(z.object({
    text: z.string().min(1).max(200),
    imageUrl: z.string().optional(),
  })).min(2, 'At least 2 options required').max(20, 'Maximum 20 options'),
});

export const castVoteSchema = z.object({
  optionId: z.string().min(1, 'Option is required'),
});

export const voteQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  isActive: z.coerce.boolean().optional(),
  creatorId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalVotes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
