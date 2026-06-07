import { Job } from 'bullmq';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function processEmailJob(job: Job<EmailJobData>) {
  const { to, subject, html } = job.data;
  logger.info(`Processing email job ${job.id} to ${to}`);
  await sendEmail({ to, subject, html });
  return { sent: true, to };
}

export async function queueEmail(data: EmailJobData) {
  try {
    const { emailQueue } = await import('../queue/index.js');
    const queue = emailQueue();
    if (!queue) {
      logger.warn('Email queue not available - sending directly');
      await sendEmail(data);
      return;
    }
    await queue.add('send', data, {
      priority: data.subject.includes('verify') ? 1 : 5,
    });
  } catch (err) {
    logger.warn('Failed to queue email - sending directly', { error: err });
    await sendEmail(data);
  }
}
