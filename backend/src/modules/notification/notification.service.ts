import prisma from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { emitNotification } from '../../socket/socket';
import { sendPushNotification } from './fcm.service';

export async function getUserNotifications(userId: string, query: { page?: number; limit?: number }) {
  const page = query.page || 1;
  const limit = query.limit || 30;

  const total = await prisma.notification.count({ where: { userId } });
  const data = await prisma.notification.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function markAsRead(id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new NotFoundError('Notification not found');
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function createNotification(data: { userId: string; type: string; title: string; message: string; data?: string }) {
  const notification = await prisma.notification.create({ data });

  emitNotification(data.userId, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  sendPushNotification(data.userId, notification.title, notification.message, {
    type: notification.type,
    notificationId: notification.id,
    data: notification.data || '',
  });

  return notification;
}
