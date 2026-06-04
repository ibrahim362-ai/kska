import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    // Sentry not configured - silently skip
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: Sentry.reactRouterV6BrowserTracingIntegration,
        useLocation: Sentry.useLocation,
        useNavigationType: Sentry.useNavigationType,
        createRoutesFromChildren: Sentry.createRoutesFromChildren,
        matchRoutes: Sentry.matchRoutes,
      }),
    ],
  });
}

export function captureException(err: Error, context?: Record<string, any>) {
  Sentry.captureException(err, { extra: context });
}

export function captureMessage(msg: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(msg, level);
}

export { Sentry };
