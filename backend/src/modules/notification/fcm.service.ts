import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';

let adminApp: any = null;

/**
 * Initialize Firebase Admin SDK once. Reads service account from
 * FIREBASE_SERVICE_ACCOUNT env (base64-encoded JSON).
 */
function getAdminApp(): any {
  if (adminApp) return adminApp;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adm = require('firebase-admin');
    if (adm.apps.length) {
      adminApp = adm.apps[0];
      return adminApp;
    }

    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountB64) {
      logger.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
      return null;
    }

    const serviceAccount = JSON.parse(Buffer.from(serviceAccountB64, 'base64').toString());
    adminApp = adm.initializeApp({ credential: adm.credential.cert(serviceAccount) });
    logger.info('Firebase Admin initialized');
    return adminApp;
  } catch (err) {
    logger.error('Firebase Admin init failed', { message: (err as Error).message });
    return null;
  }
}

/**
 * Get all FCM tokens for a user (stored in deviceSessions JSON array).
 */
async function getUserTokens(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.deviceSessions) return [];
  try {
    const tokens = JSON.parse(user.deviceSessions);
    return Array.isArray(tokens) ? tokens : [];
  } catch {
    return [];
  }
}

/**
 * Send a push notification to a single user (all their devices).
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  const app = getAdminApp();
  if (!app) return { sent: 0, failed: 0 };

  const tokens = await getUserTokens(userId);
  if (tokens.length === 0) return { sent: 0, failed: 0 };

  return sendToTokens(tokens, title, body, data);
}

/**
 * Send a push to a list of users.
 */
export async function sendPushToMultiple(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  const allTokens: string[] = [];
  for (const userId of userIds) {
    const tokens = await getUserTokens(userId);
    allTokens.push(...tokens);
  }
  if (allTokens.length === 0) return { sent: 0, failed: 0 };
  return sendToTokens(allTokens, title, body, data);
}

/**
 * Send to specific tokens (low-level).
 */
export async function sendToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  const app = getAdminApp();
  if (!app) return { sent: 0, failed: 0 };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adm = require('firebase-admin');
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    const response = await adm.messaging().sendEachForMulticast(message);
    logger.info(`[FCM] Sent to ${tokens.length} tokens: ${response.successCount} success, ${response.failureCount} failed`);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      });
      if (invalidTokens.length > 0) {
        await cleanupInvalidTokens(invalidTokens);
      }
    }

    return { sent: response.successCount, failed: response.failureCount };
  } catch (err) {
    logger.error('[FCM] Send failed', { message: (err as Error).message });
    return { sent: 0, failed: tokens.length };
  }
}

/**
 * Remove invalid tokens from users' deviceSessions.
 */
async function cleanupInvalidTokens(invalidTokens: string[]) {
  try {
    const users = await prisma.user.findMany({
      where: { deviceSessions: { contains: '"' } },
    });
    for (const user of users) {
      if (!user.deviceSessions) continue;
      try {
        let tokens: string[] = JSON.parse(user.deviceSessions);
        const before = tokens.length;
        tokens = tokens.filter((t) => !invalidTokens.includes(t));
        if (tokens.length !== before) {
          await prisma.user.update({
            where: { id: user.id },
            data: { deviceSessions: JSON.stringify(tokens) },
          });
          logger.info(`Cleaned up ${before - tokens.length} invalid tokens for user ${user.id}`);
        }
      } catch {
        // skip malformed
      }
    }
  } catch (err) {
    logger.error('Token cleanup failed', { message: (err as Error).message });
  }
}

/**
 * Register a token (legacy compat — now handled by user.service).
 */
export async function registerToken(userId: string, _fcmToken: string) {
  // Now handled by user.service.registerFcmToken (stores as array)
  logger.warn('registerToken called — use user.service.registerFcmToken instead');
}
