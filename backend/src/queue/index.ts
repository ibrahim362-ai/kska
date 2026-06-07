// Queue system disabled - Redis not required
// Background jobs will run synchronously when called

export function getConnection() {
  return null;
}

export function getConnectionOptions() {
  return null;
}

export const QUEUE_NAMES = {
  EMAIL: 'email',
  PUSH_NOTIFICATION: 'push-notification',
  LEADERBOARD_RECOMPUTE: 'leaderboard-recompute',
  MANUAL_PAYMENT_REMINDER: 'manual-payment-reminder',
} as const;

export function getQueue(_name: string) {
  return null;
}

export const emailQueue = () => null;
export const pushQueue = () => null;
export const leaderboardQueue = () => null;

export function registerWorker(_name: string, _processor: (job: any) => Promise<any>) {
  // No workers without Redis
  return null;
}

export async function startWorkers() {
  // No workers to start
}

export async function closeAllQueues() {
  // No queues to close
}
