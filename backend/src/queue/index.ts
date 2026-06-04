import { Queue, Worker, QueueEvents, ConnectionOptions } from 'bullmq';
import IORedis, { Redis } from 'ioredis';
import { config, isTest } from '../config';
import { logger } from '../utils/logger';

let connection: Redis | null = null;

export function getConnection(): Redis {
  if (!connection) {
    connection = new IORedis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: !isTest,
    });
    connection.on('connect', () => logger.info('Redis connected'));
    connection.on('error', (err) => logger.error('Redis error', { message: err.message }));
  }
  return connection;
}

export function getConnectionOptions(): ConnectionOptions {
  return { connection: getConnection() };
}

// =====================================================================
// Queue names
// =====================================================================
export const QUEUE_NAMES = {
  EMAIL: 'email',
  PUSH_NOTIFICATION: 'push-notification',
  LEADERBOARD_RECOMPUTE: 'leaderboard-recompute',
  MANUAL_PAYMENT_REMINDER: 'manual-payment-reminder',
} as const;

// =====================================================================
// Singleton queue registry
// =====================================================================
const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    queues.set(
      name,
      new Queue(name, {
        connection: getConnection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { count: 100, age: 24 * 3600 },
          removeOnFail: { count: 500, age: 7 * 24 * 3600 },
        },
      })
    );
  }
  return queues.get(name)!;
}

// =====================================================================
// Job helpers
// =====================================================================
export const emailQueue = () => getQueue(QUEUE_NAMES.EMAIL);
export const pushQueue = () => getQueue(QUEUE_NAMES.PUSH_NOTIFICATION);
export const leaderboardQueue = () => getQueue(QUEUE_NAMES.LEADERBOARD_RECOMPUTE);

// =====================================================================
// Worker registry
// =====================================================================
const workers: Worker[] = [];

export function registerWorker(name: string, processor: (job: any) => Promise<any>): Worker {
  const worker = new Worker(name, processor, { connection: getConnection() });
  worker.on('completed', (job) => logger.info(`Job ${name}#${job.id} completed`));
  worker.on('failed', (job, err) =>
    logger.error(`Job ${name}#${job?.id} failed`, { message: err.message })
  );
  workers.push(worker);
  return worker;
}

// =====================================================================
// Lifecycle
// =====================================================================
export async function startWorkers() {
  if (isTest) return; // Don't start workers in tests

  // Email worker
  const { processEmailJob } = await import('../jobs/email.job');
  registerWorker(QUEUE_NAMES.EMAIL, processEmailJob);

  // Push notification worker
  const { processPushJob } = await import('../jobs/push.job');
  registerWorker(QUEUE_NAMES.PUSH_NOTIFICATION, processPushJob);

  // Leaderboard recompute
  const { processLeaderboardJob } = await import('../jobs/leaderboard.job');
  registerWorker(QUEUE_NAMES.LEADERBOARD_RECOMPUTE, processLeaderboardJob);

  logger.info(`Started ${workers.length} background workers`);
}

export async function closeAllQueues() {
  await Promise.all(workers.map((w) => w.close()));
  await Promise.all(Array.from(queues.values()).map((q) => q.close()));
  if (connection) await connection.quit();
  workers.length = 0;
  queues.clear();
  connection = null;
}
