import { Request, Response, NextFunction } from 'express';

const API_VERSION = '1.0.0';
const API_NAME = 'kska-api';

/**
 * Add API version headers to every response.
 * Helps clients detect breaking changes.
 */
export function apiVersion(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-API-Version', API_VERSION);
  res.setHeader('X-API-Name', API_NAME);
  res.setHeader('X-API-Released', '2026-06-04');
  next();
}

export { API_VERSION, API_NAME };
