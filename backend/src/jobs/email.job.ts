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
  const { to, subject, html, text } = job.data;
  logger.info(`Processing email job ${job.id} to ${to}`);
  await sendEmail({ to, subject, html, text });
  return { sent: true, to };
}

export async function queueEmail(data: EmailJobData) {
  const { emailQueue } = await import('../queue');
  await emailQueue().add('send', data, {
    priority: data.subject.includes('verify') ? 1 : 5,
  });
}
