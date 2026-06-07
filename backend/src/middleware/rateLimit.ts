import rateLimit, { RateLimitRequestHandler, Options, ipKeyGenerator } from 'express-rate-limit';
import { isTest, isProd } from '../config';
import { logger } from '../utils/logger';

/**
 * Build a rate limiter using in-memory store (no Redis needed)
 */
function makeLimiter(options: Partial<Options> & { windowMs: number; max: number | ((req: any) => number) }): RateLimitRequestHandler {
  const baseOptions: Partial<Options> = {
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    // Use ipKeyGenerator helper for proper IPv6 handling
    keyGenerator: ipKeyGenerator,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api/health/deep';
    },
    handler: (req, res, _next, options) => {
      logger.warn(`Rate limit exceeded`, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${Math.ceil(options.windowMs / 1000)} seconds.`,
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  };

  // Always use in-memory store (no Redis)
  return rateLimit({ ...baseOptions, ...options } as Options);
}

// =====================================================================
// Pre-configured limiters
// =====================================================================

/** General API limiter: 500 req / 15 min / user or IP */
export const generalLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

/** Strict auth limiter: 10 attempts / 15 min — protects against brute force */
export const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

/** Password reset / OTP: 5 / hour */
export const passwordResetLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

/** Receipt upload (manual payment proof): 10 / hour per user */
export const uploadLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

/** Post creation: 30 / hour per user */
export const postCreationLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
});

/** Vote casting: 60 / hour per user (anti-spam) */
export const voteLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
});

/** Ticket purchase: 10 / hour per user */
export const purchaseLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

/** Admin review actions: 100 / hour */
export const adminLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
});

if (isProd) {
  // noop, but reserved for hooking in metrics later
}
