import { Job } from 'bullmq';
import { logger } from '../../utils/logger';

export interface PushJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function processPushJob(job: Job<PushJobData>) {
  const { userId, title, body } = job.data;
  logger.info(`Processing push job ${job.id} for user ${userId}: ${title}`);

  // Firebase FCM integration goes here once FIREBASE_SERVICE_ACCOUNT is set
  // For now, just log it. When configured, will call:
  // await sendFCMNotification(userId, { title, body, data: job.data.data });

  return { processed: true, userId };
}

export async function queuePush(data: PushJobData) {
  try {
    const queueModule = await import('../../queue/index.js');
    const queue = queueModule.pushQueue();
    if (!queue) return;
    await queue.add('send', data);
  } catch (err) {
    // Queue not available
  }
}
