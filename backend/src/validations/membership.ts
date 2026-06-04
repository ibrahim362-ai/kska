import { z } from 'zod';

export const createMembershipSchema = z.object({
  name: z.string().min(2),
  planType: z.enum(['FREE', 'SILVER', 'GOLD', 'VIP']),
  price: z.number().min(0),
  duration: z.number().int().min(1),
  badgeIcon: z.string().optional(),
  extraVotes: z.number().int().min(0).default(0),
  priorityTicket: z.boolean().default(false),
  leaderboardBoost: z.number().min(0.1).default(1.0),
});

export const updateMembershipSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().min(0).optional(),
  duration: z.number().int().min(1).optional(),
  badgeIcon: z.string().optional(),
  extraVotes: z.number().int().min(0).optional(),
  priorityTicket: z.boolean().optional(),
  leaderboardBoost: z.number().min(0.1).optional(),
  isActive: z.boolean().optional(),
});

export const purchaseMembershipSchema = z.object({
  membershipId: z.string().min(1),
  autoRenew: z.boolean().default(false),
});
