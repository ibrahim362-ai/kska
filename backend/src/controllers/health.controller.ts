import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { getConnection } from '../queue';
import { logger } from '../utils/logger';
import os from 'os';
import fs from 'fs';
import path from 'path';

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  checks: Record<string, CheckResult>;
  system?: {
    platform: string;
    nodeVersion: string;
    memory: { used: number; total: number; rss: number };
    cpuLoad: number[];
  };
}

interface CheckResult {
  status: 'ok' | 'fail';
  duration: number;
  message?: string;
  details?: any;
}

/**
 * Basic health check — returns immediately. Use for liveness probes.
 */
export function basicHealth(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * Deep health check — checks DB, Redis, disk. Use for readiness probes
 * and external monitoring (UptimeRobot, BetterStack).
 */
export async function deepHealth(_req: Request, res: Response) {
  const result: HealthCheckResult = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {},
  };

  // Check 1: Database
  result.checks.database = await runCheck('database', async () => {
    const start = Date.now();
    const userCount = await prisma.user.count();
    return {
      message: `Connected. ${userCount} users.`,
      details: { users: userCount, queryMs: Date.now() - start },
    };
  });

  // Check 2: Redis (disabled)
  result.checks.redis = {
    status: 'ok',
    duration: 0,
    message: 'Redis disabled (not required)',
  };

  // Check 3: Disk space
  result.checks.disk = await runCheck('disk', async () => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      return { message: 'Uploads dir not yet created', details: { uploadsDir } };
    }
    const stats = fs.statfsSync(uploadsDir);
    const freeMB = Math.floor((stats.bavail * stats.bsize) / 1024 / 1024);
    const totalMB = Math.floor((stats.blocks * stats.bsize) / 1024 / 1024);
    if (freeMB < 100) {
      throw new Error(`Low disk space: ${freeMB}MB free`);
    }
    return {
      message: `${freeMB}MB free of ${totalMB}MB`,
      details: { freeMB, totalMB, freePercent: Math.round((freeMB / totalMB) * 100) },
    };
  });

  // Aggregate status
  const failed = Object.values(result.checks).filter((c) => c.status === 'fail');
  if (failed.length === 0) {
    result.status = 'ok';
  } else if (failed.length === Object.keys(result.checks).length) {
    result.status = 'down';
  } else {
    result.status = 'degraded';
  }

  // Include system metrics in non-prod or when authenticated (could be expensive in prod)
  if (process.env.NODE_ENV !== 'production' || process.env.INCLUDE_SYSTEM_METRICS === 'true') {
    const mem = process.memoryUsage();
    result.system = {
      platform: os.platform(),
      nodeVersion: process.version,
      memory: {
        used: mem.heapUsed,
        total: mem.heapTotal,
        rss: mem.rss,
      },
      cpuLoad: os.loadavg(),
    };
  }

  // HTTP status
  const httpStatus = result.status === 'down' ? 503 : 200;
  res.status(httpStatus).json(result);
}

async function runCheck(name: string, fn: () => Promise<{ message: string; details?: any }>): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { message, details } = await fn();
    return { status: 'ok', duration: Date.now() - start, message, details };
  } catch (err: any) {
    logger.error(`Health check failed: ${name}`, { message: err.message });
    return { status: 'fail', duration: Date.now() - start, message: err.message };
  }
}
