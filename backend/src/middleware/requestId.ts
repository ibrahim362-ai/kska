import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
  }
}

/**
 * Attach a unique request ID to every incoming request.
 * Honors incoming `X-Request-Id` header if present, otherwise generates a new UUID.
 * Adds `X-Request-Id` to response for client-side debugging.
 */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers['x-request-id'] as string | undefined;
  const id = incoming && /^[a-zA-Z0-9_-]{1,128}$/.test(incoming) ? incoming : randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
