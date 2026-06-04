import prisma from '../../config/prisma';

export async function getDashboard(userId: string) {
  const [totalTickets, totalPosts, totalVotes, totalCheckIns] = await Promise.all([
    prisma.ticket.count({ where: { creatorId: userId } }),
    prisma.post.count({ where: { userId } }),
    prisma.vote.count({ where: { creatorId: userId } }),
    prisma.ticketPurchase.count({ where: { checkedInBy: userId, checkedIn: true } }),
  ]);

  const recentCheckIns = await prisma.ticketPurchase.findMany({
    where: { checkedInBy: userId, checkedIn: true },
    take: 5,
    orderBy: { checkedInAt: 'desc' },
    include: {
      ticket: { select: { title: true } },
      user: { select: { id: true, fullName: true } },
    },
  });

  const recentTickets = await prisma.ticket.findMany({
    where: { creatorId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return {
    totalTickets,
    totalPosts,
    totalVotes,
    totalCheckIns,
    recentCheckIns,
    recentTickets,
  };
}

export async function getAnalytics(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { creatorId: userId },
    select: { id: true, title: true, soldCount: true, quantity: true, price: true },
    orderBy: { soldCount: 'desc' },
    take: 10,
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: 'COMPLETED',
      metadata: { contains: userId },
    },
  });

  return {
    topTickets: tickets,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}
