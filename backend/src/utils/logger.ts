import { config, isProd } from '../config';

let sentryInitialized = false;
let Sentry: any = null;

async function initSentry() {
  if (sentryInitialized || !config.sentry.dsn) return;
  try {
    Sentry = await import('@sentry/node');
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.nodeEnv,
      release: process.env.npm_package_version || 'unknown',
      tracesSampleRate: isProd ? 0.1 : 1.0,
      profilesSampleRate: isProd ? 0.1 : 1.0,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        Sentry.prismaIntegration(),
      ],
    });
    sentryInitialized = true;
  } catch (err) {
    console.warn('Sentry init failed (continuing without it):', err);
  }
}

initSentry();

const levels = ['error', 'warn', 'info', 'debug'] as const;
type LogLevel = (typeof levels)[number];

const currentLevel: LogLevel = (config.logLevel as LogLevel) || 'debug';

function formatMessage(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function sendToSentry(level: LogLevel, message: string, meta?: any) {
  if (!Sentry || !sentryInitialized) return;
  if (level === 'error') {
    if (meta?.stack) {
      Sentry.captureException(new Error(message), { extra: meta });
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: meta });
    }
  } else if (level === 'warn') {
    Sentry.captureMessage(message, { level: 'warning', extra: meta });
  }
}

export const logger = {
  error: (message: string, meta?: any) => {
    if (levels.indexOf('error') <= levels.indexOf(currentLevel)) {
      console.error(formatMessage('error', message, meta));
      sendToSentry('error', message, meta);
    }
  },
  warn: (message: string, meta?: any) => {
    if (levels.indexOf('warn') <= levels.indexOf(currentLevel)) {
      console.warn(formatMessage('warn', message, meta));
      sendToSentry('warn', message, meta);
    }
  },
  info: (message: string, meta?: any) => {
    if (levels.indexOf('info') <= levels.indexOf(currentLevel)) {
      console.info(formatMessage('info', message, meta));
    }
  },
  debug: (message: string, meta?: any) => {
    if (levels.indexOf('debug') <= levels.indexOf(currentLevel)) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};

export function getSentry() {
  return Sentry;
}
