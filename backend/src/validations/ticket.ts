import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).default(0),
  quantity: z.number().int().min(1).default(100),
  eventDate: z.coerce.date(),
  location: z.string().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().int().min(1).optional(),
  eventDate: z.coerce.date().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'SOLD_OUT', 'CANCELLED']).optional(),
});

export const purchaseTicketSchema = z.object({
  ticketId: z.string().min(1),
});

export const checkInTicketSchema = z.object({
  purchaseId: z.string().min(1),
});

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().optional(),
  creatorId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'eventDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
