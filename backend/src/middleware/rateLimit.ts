import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getConnection } from '../queue';
import { isTest, isProd } from '../config';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';

/**
 * Build a rate limiter that uses Redis when available (multi-instance safe),
 * falls back to in-memory when Redis is down or in tests.
 */
function makeLimiter(options: Partial<Options> & { windowMs: number; max: number | ((req: any) => number); name: string }): RateLimitRequestHandler {
  const baseOptions: Partial<Options> = {
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Prefer authenticated user ID
      const userId = (req as AuthRequest).user?.userId;
      if (userId) return `user:${userId}`;
      return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    },
    handler: (req, res, _next, options) => {
      logger.warn(`Rate limit exceeded: ${options.name}`, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: (req as AuthRequest).user?.userId,
      });
      res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${Math.ceil(options.windowMs / 1000)} seconds.`,
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  };

  if (isTest) {
    // Use in-memory store in tests (faster, no Redis dependency)
    return rateLimit({ ...baseOptions, ...options } as Options);
  }

  try {
    const store = new RedisStore({
      sendCommand: (...args: string[]) => getConnection().call(...args) as Promise<any>,
      prefix: `rl:${options.name}:`,
    });
    return rateLimit({ ...baseOptions, store, ...options } as Options);
  } catch (err) {
    logger.warn(`Redis store init failed for ${options.name}, using memory`, { message: (err as Error).message });
    return rateLimit({ ...baseOptions, ...options } as Options);
  }
}

// =====================================================================
// Pre-configured limiters
// =====================================================================

/** General API limiter: 100 req / 15 min / user or IP */
export const generalLimiter = makeLimiter({
  name: 'general',
  windowMs: 15 * 60 * 1000,
  max: 500,
});

/** Strict auth limiter: 10 attempts / 15 min — protects against brute force */
export const authLimiter = makeLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 10,
});

/** Password reset / OTP: 5 / hour */
export const passwordResetLimiter = makeLimiter({
  name: 'password-reset',
  windowMs: 60 * 60 * 1000,
  max: 5,
});

/** Receipt upload (manual payment proof): 10 / hour per user */
export const uploadLimiter = makeLimiter({
  name: 'upload',
  windowMs: 60 * 60 * 1000,
  max: 10,
});

/** Post creation: 30 / hour per user */
export const postCreationLimiter = makeLimiter({
  name: 'post-create',
  windowMs: 60 * 60 * 1000,
  max: 30,
});

/** Vote casting: 60 / hour per user (anti-spam) */
export const voteLimiter = makeLimiter({
  name: 'vote',
  windowMs: 60 * 60 * 1000,
  max: 60,
});

/** Ticket purchase: 10 / hour per user */
export const purchaseLimiter = makeLimiter({
  name: 'purchase',
  windowMs: 60 * 60 * 1000,
  max: 10,
});

/** Admin review actions: 100 / hour */
export const adminLimiter = makeLimiter({
  name: 'admin',
  windowMs: 60 * 60 * 1000,
  max: 100,
});

/** In prod, log when limits are hit for monitoring */
if (isProd) {
  // noop, but reserved for hooking in metrics later
}
