import prisma from '../../config/prisma';

export async function logAction(data: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data });
}

export async function getAuditLogs(query: { page: number; limit: number; userId?: string; action?: string }) {
  const where: any = {};
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = query.action;

  const total = await prisma.auditLog.count({ where });
  const data = await prisma.auditLog.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
