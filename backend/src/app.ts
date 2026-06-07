import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { AppError } from './utils/errors';
import { sendError } from './utils/apiResponse';
import { logger, getSentry } from './utils/logger';
import { mountSwagger } from './config/swagger';
import { generalLimiter } from './middleware/rateLimit';
import { requestId } from './middleware/requestId';
import { sanitizeInput } from './middleware/sanitize';
import { apiVersion } from './middleware/apiVersion';
import { basicHealth, deepHealth } from './controllers/health.controller';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import postRoutes from './modules/post/post.routes';
import voteRoutes from './modules/vote/vote.routes';
import membershipRoutes from './modules/membership/membership.routes';
import ticketRoutes from './modules/ticket/ticket.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import notificationRoutes from './modules/notification/notification.routes';
import paymentRoutes from './modules/payment/payment.routes';
import manualPaymentRoutes from './modules/payment/manualPayment.routes';
import uploadRoutes from './modules/upload/upload.routes';
import settingsRoutes from './modules/settings/settings.routes';
import employerRoutes from './modules/employer/employer.routes';
import adminRoutes from './modules/admin/admin.routes';
import iconRoutes from './modules/icon/icon.routes';
import challengeRoutes from './modules/challenge/challenge.routes';

const app = express();

app.disable('etag');

const Sentry = getSentry();
if (Sentry?.Handlers?.requestHandler) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Request ID for tracing (must come before other middleware)
app.use(requestId);

// API version headers
app.use(apiVersion);

// Sanitize all string inputs to prevent XSS
app.use(sanitizeInput);

// Security: helmet with stricter CSP in production
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
  })
);

// CORS: whitelist based on env
app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin (mobile apps, curl, Postman) in dev
    if (!origin) return callback(null, true);
    const allowed = config.frontendUrl.split(',').map((u) => u.trim());
    if (allowed.includes(origin) || config.nodeEnv !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// General API rate limit (per-user or per-IP)
app.use('/api/', generalLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/manual-payments', manualPaymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/icons', iconRoutes);
app.use('/api/challenges', challengeRoutes);

app.get('/api/health', basicHealth);
app.get('/api/health/deep', deepHealth);

mountSwagger(app);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err.message, { statusCode: err.statusCode });
    return sendError({ res, statusCode: err.statusCode, message: err.message });
  }

  logger.error(err.message, { stack: err.stack });

  if (Sentry?.captureException) {
    Sentry.captureException(err);
  }

  return sendError({ res, statusCode: 500, message: `Internal server error: ${err.message}` });
});

export default app;
