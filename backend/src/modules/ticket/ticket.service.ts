import QRCode from 'qrcode';
import crypto from 'crypto';
import prisma from '../../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../utils/errors';
import { emitTicketCheckIn } from '../../socket/socket';
import { IconService } from '../../services/icon.service';

export async function createTicket(creatorId: string, data: {
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  quantity: number;
  eventDate: string;
  location?: string;
  hasVipOption?: boolean;
  vipPrice?: number;
  vipPoints?: number;
  familyTicket?: boolean;
  maxFamilyMembers?: number;
  discount?: number;
  pointsReward?: number;
}) {
  const ticket = await prisma.ticket.create({
    data: {
      creatorId,
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      price: data.price,
      quantity: data.quantity,
      eventDate: new Date(data.eventDate),
      location: data.location,
      hasVipOption: data.hasVipOption || false,
      vipPrice: data.vipPrice,
      vipPoints: data.vipPoints || 30,
      familyTicket: data.familyTicket || false,
      maxFamilyMembers: data.maxFamilyMembers,
      discount: data.discount || 0,
      pointsReward: data.pointsReward || 0,
    },
    include: {
      creator: { select: { id: true, username: true, fullName: true } },
    },
  });

  const qrCodeData = await QRCode.toDataURL(`ticket:${ticket.id}`);
  return prisma.ticket.update({
    where: { id: ticket.id },
    data: { qrCode: qrCodeData },
    include: {
      creator: { select: { id: true, username: true, fullName: true } },
    },
  });
}

export async function getTickets(query: {
  page: number;
  limit: number;
  status?: string;
  creatorId?: string;
  sortBy: string;
  sortOrder: string;
}) {
  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.creatorId) where.creatorId = query.creatorId;

  const total = await prisma.ticket.count({ where });
  const tickets = await prisma.ticket.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { [query.sortBy]: query.sortOrder },
    include: {
      creator: { select: { id: true, username: true, fullName: true } },
    },
  });

  return {
    data: tickets,
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, fullName: true } },
    },
  });
  if (!ticket) throw new NotFoundError('Ticket not found');
  return ticket;
}

export async function updateTicket(id: string, userId: string, data: any) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.creatorId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenError('Not authorized');
    }
  }

  return prisma.ticket.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, username: true, fullName: true } },
    },
  });
}

export async function deleteTicket(id: string, userId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.creatorId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenError('Not authorized');
    }
  }
  await prisma.ticket.delete({ where: { id } });
}

export async function purchaseTicket(
  userId: string, 
  ticketId: string, 
  referralCode?: string,
  options?: {
    isVip?: boolean;
    isGift?: boolean;
    recipientName?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    familyMembers?: string; // JSON string
  }
) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.status !== 'ACTIVE') throw new BadRequestError('Ticket is not available');

  const isVip = options?.isVip || false;
  const isGift = options?.isGift || false;

  // Validate VIP option
  if (isVip && !ticket.hasVipOption) {
    throw new BadRequestError('VIP option not available for this ticket');
  }

  // Parse and validate family members
  let familyMembersArray: string[] = [];
  if (options?.familyMembers && ticket.familyTicket) {
    try {
      familyMembersArray = JSON.parse(options.familyMembers);
      if (ticket.maxFamilyMembers && familyMembersArray.length > ticket.maxFamilyMembers) {
        throw new BadRequestError(`Maximum ${ticket.maxFamilyMembers} family members allowed`);
      }
      if (familyMembersArray.length === 0) {
        throw new BadRequestError('Family ticket requires at least 1 family member');
      }
    } catch (e) {
      throw new BadRequestError('Invalid family members format');
    }
  }

  // Calculate final price with discount and family members
  let basePrice = isVip ? (ticket.vipPrice || ticket.price) : ticket.price;
  
  // For family tickets, multiply by number of family members
  if (ticket.familyTicket && familyMembersArray.length > 0) {
    basePrice = basePrice * familyMembersArray.length;
  }
  
  const finalPrice = ticket.discount > 0 
    ? basePrice * (1 - ticket.discount / 100)
    : basePrice;

  // Validate referral code if provided
  let referrerId: string | undefined;
  if (referralCode) {
    const referrerPurchase = await prisma.ticketPurchase.findUnique({
      where: { referralCode },
      select: { userId: true },
    });
    
    if (referrerPurchase) {
      // Cannot use own referral code
      if (referrerPurchase.userId === userId) {
        throw new BadRequestError('Cannot use your own referral code');
      }
      referrerId = referrerPurchase.userId;
    }
    // If code not found, silently ignore (don't block purchase)
  }

  const userMembership = await prisma.userMembership.findFirst({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: { membership: true },
  });

  const hasPriority = userMembership?.membership?.priorityTicket || false;

  if (!hasPriority && ticket.soldCount >= ticket.quantity) {
    throw new BadRequestError('Ticket sold out');
  }

  if (hasPriority && ticket.soldCount >= ticket.quantity + Math.floor(ticket.quantity * 0.1)) {
    throw new BadRequestError('Ticket sold out (including priority allocation)');
  }

  // Check if user already has an active purchase (PAID or PENDING)
  const existing = await prisma.ticketPurchase.findFirst({
    where: { 
      userId, 
      ticketId, 
      status: { in: ['PAID', 'PENDING'] }  // Check both PAID and PENDING
    },
  });
  if (existing) {
    if (existing.status === 'PENDING') {
      throw new ConflictError('You have a pending purchase for this ticket. Please complete the payment or wait for approval.');
    }
    throw new ConflictError('You already purchased this ticket');
  }

  // Generate unique referral code for this purchase
  const newReferralCode = `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Calculate points to award
  const pointsAwarded = isVip ? ticket.vipPoints : ticket.pointsReward;

  const purchase = await prisma.ticketPurchase.create({
    data: {
      ticketId,
      userId,
      status: finalPrice > 0 ? 'PENDING' : 'PAID',
      seatNumber: `A${ticket.soldCount + 1}`,
      referralCode: newReferralCode,
      referredBy: referrerId,
      isVip,
      isGift,
      recipientName: options?.recipientName,
      recipientPhone: options?.recipientPhone,
      recipientEmail: options?.recipientEmail,
      familyMembers: options?.familyMembers,
      finalPrice,
      pointsAwarded: 0, // Will be awarded after payment completion
    },
    include: { ticket: true },
  });

  let payment = null;
  if (finalPrice > 0) {
    const reference = `TKT-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
    payment = await prisma.payment.create({
      data: {
        userId,
        amount: finalPrice,
        currency: 'ETB',
        method: 'MANUAL',
        status: 'PENDING',
        reference,
        ticketPurchaseId: purchase.id,
        metadata: JSON.stringify({ type: 'TICKET', purchaseId: purchase.id, ticketId, isVip, isGift }),
      },
    });
  }

  if (finalPrice === 0) {
    const qrData = await QRCode.toDataURL(`purchase:${purchase.id}`);
    await prisma.ticketPurchase.update({ 
      where: { id: purchase.id }, 
      data: { 
        qrCode: qrData,
        pointsAwarded 
      } 
    });
    await prisma.ticket.update({ where: { id: ticketId }, data: { soldCount: { increment: 1 } } });
    
    // Award points for free ticket
    if (pointsAwarded > 0) {
      try {
        await IconService.awardIcons(
          userId,
          pointsAwarded,
          'TICKET_PURCHASE',
          `Purchased ${isVip ? 'VIP ' : ''}ticket: ${ticket.title}`,
          { ticketId, purchaseId: purchase.id, isVip }
        );
      } catch (error) {
        console.error('Failed to award ticket purchase points:', error);
      }
    }
    
    // Award referrer if valid referral code was used
    if (referrerId) {
      try {
        await IconService.awardIcons(
          referrerId,
          10,
          'REFERRAL',
          'Someone used your referral code',
          { 
            referredUserId: userId, 
            ticketId,
            purchaseId: purchase.id,
            referralCode: newReferralCode 
          }
        );
      } catch (error) {
        console.error('Failed to award referral icons:', error);
      }
    }
  }

  return { ...purchase, payment };
}

export async function getUserPurchases(userId: string) {
  return prisma.ticketPurchase.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { ticket: true },
  });
}

export async function checkInTicket(checkerId: string, purchaseId: string) {
  const purchase = await prisma.ticketPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) throw new NotFoundError('Purchase not found');
  if (purchase.status !== 'PAID') throw new BadRequestError('Ticket not paid');
  if (purchase.checkedIn) throw new ConflictError('Already checked in');

  const qrData = await QRCode.toDataURL(`checkin:${purchase.id}:${Date.now()}`);

  const updated = await prisma.ticketPurchase.update({
    where: { id: purchaseId },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: checkerId,
      qrCode: qrData,
    },
    include: {
      ticket: true,
      user: { select: { id: true, fullName: true } },
    },
  });

  emitTicketCheckIn({
    purchaseId: updated.id,
    ticketId: updated.ticketId,
    ticketTitle: updated.ticket.title,
    userId: updated.userId,
    userName: updated.user.fullName,
    checkedInAt: updated.checkedInAt,
  });

  // Award 10 icons for checkin
  try {
    await IconService.awardIcons(
      updated.userId,
      10,
      'CHECKIN',
      `Checked in to: ${updated.ticket.title}`,
      { ticketId: updated.ticketId, purchaseId: updated.id, ticketTitle: updated.ticket.title }
    );
  } catch (error) {
    console.error('Failed to award checkin icons:', error);
  }

  return updated;
}

export async function getTicketAnalytics() {
  const [totalTickets, totalPurchases, totalCheckedIn, totalRevenue] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticketPurchase.count(),
    prisma.ticketPurchase.count({ where: { checkedIn: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
  ]);

  const topTickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { soldCount: 'desc' },
    select: { id: true, title: true, soldCount: true, price: true },
  });

  return {
    totalTickets,
    totalPurchases,
    totalCheckedIn,
    totalRevenue: totalRevenue._sum.amount || 0,
    topTickets,
  };
}

export async function getMyCheckIns(checkerId: string) {
  return prisma.ticketPurchase.findMany({
    where: { checkedInBy: checkerId, checkedIn: true },
    orderBy: { checkedInAt: 'desc' },
    include: {
      ticket: true,
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export async function generatePdfTicket(purchaseId: string) {
  const purchase = await prisma.ticketPurchase.findUnique({
    where: { id: purchaseId },
    include: { ticket: true, user: { select: { id: true, fullName: true, email: true } } },
  });

  if (!purchase) throw new NotFoundError('Purchase not found');

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size: 'A6', margin: 20 });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(18).text('TICKET', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(purchase.ticket.title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Attendee: ${purchase.user.fullName}`);
  doc.text(`Email: ${purchase.user.email}`);
  doc.text(`Seat: ${purchase.seatNumber || 'General'}`);
  doc.text(`Date: ${new Date(purchase.ticket.eventDate).toLocaleDateString()}`);
  if (purchase.ticket.location) doc.text(`Location: ${purchase.ticket.location}`);
  doc.moveDown(0.5);
  doc.text(`Purchase ID: ${purchase.id}`, { align: 'center' });
  doc.text(`Status: ${purchase.status}`, { align: 'center' });

  if (purchase.qrCode) {
    try {
      const qrBuffer = Buffer.from(purchase.qrCode.split(',')[1], 'base64');
      doc.image(qrBuffer, doc.page.width / 2 - 50, doc.y, { width: 100, height: 100 });
    } catch {
      doc.text('[QR Code]', { align: 'center' });
    }
  }

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function requestRefund(userId: string, purchaseId: string, reason: string) {
  const purchase = await prisma.ticketPurchase.findUnique({
    where: { id: purchaseId },
    include: { ticket: true },
  });

  if (!purchase) throw new NotFoundError('Purchase not found');
  if (purchase.userId !== userId) throw new ForbiddenError('Not authorized');
  if (purchase.status !== 'PAID') throw new BadRequestError('Ticket not paid');
  if (purchase.checkedIn) throw new BadRequestError('Cannot refund checked-in ticket');

  const existingRefund = await prisma.refund.findFirst({
    where: { purchaseId, status: { in: ['PENDING', 'APPROVED'] } },
  });

  if (existingRefund) throw new BadRequestError('Refund already requested');

  const refund = await prisma.refund.create({
    data: {
      purchaseId,
      userId,
      amount: purchase.ticket.price,
      reason,
      status: 'PENDING',
    },
  });

  return refund;
}

export async function processRefund(adminId: string, refundId: string, status: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { purchase: true },
  });

  if (!refund) throw new NotFoundError('Refund not found');
  if (refund.status !== 'PENDING') throw new BadRequestError('Refund already processed');

  const updated = await prisma.refund.update({
    where: { id: refundId },
    data: { status, processedBy: adminId },
  });

  if (status === 'APPROVED') {
    await prisma.ticketPurchase.update({
      where: { id: refund.purchaseId },
      data: { status: 'REFUNDED' },
    });

    await prisma.ticket.update({
      where: { id: refund.purchase.ticketId },
      data: { soldCount: { decrement: 1 } },
    });
  }

  return updated;
}

export async function getRefunds(query: { page: any; limit: any; status?: string }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const where: any = {};
  if (query.status) where.status = query.status;

  const total = await prisma.refund.count({ where });
  const data = await prisma.refund.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      purchase: { include: { ticket: true } },
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function transferTicket(userId: string, purchaseId: string, toUserId: string) {
  const purchase = await prisma.ticketPurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) throw new NotFoundError('Purchase not found');
  if (purchase.userId !== userId) throw new ForbiddenError('Not authorized');
  if (purchase.status !== 'PAID') throw new BadRequestError('Ticket not paid');
  if (purchase.checkedIn) throw new BadRequestError('Cannot transfer checked-in ticket');

  const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!toUser) throw new NotFoundError('Recipient user not found');

  const transfer = await prisma.ticketTransfer.create({
    data: {
      purchaseId,
      fromUserId: userId,
      toUserId,
      status: 'COMPLETED',
    },
  });

  await prisma.ticketPurchase.update({
    where: { id: purchaseId },
    data: { userId: toUserId },
  });

  return transfer;
}

export async function getTransfers(userId: string, query: { page: any; limit: any }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;

  const total = await prisma.ticketTransfer.count({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
  });

  const data = await prisma.ticketTransfer.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      purchase: { include: { ticket: true } },
      fromUser: { select: { id: true, fullName: true } },
      toUser: { select: { id: true, fullName: true } },
    },
  });

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
