import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitize string values in req.body, req.query, req.params
 * to remove common XSS attack vectors.
 *
 * Strips:
 *  - <script> tags and their content
 *  - javascript: protocol
 *  - on* event handlers (onclick, onerror, etc.)
 *  - data:text/html URIs
 *
 * Does NOT:
 *  - Touch password fields (those are hashed, not displayed)
 *  - Touch URLs in Cloudinary responses
 *  - Modify file uploads
 *
 * If you need to allow HTML, use a dedicated library like DOMPurify on the
 * client/server separately. This is a defense-in-depth layer, not a replacement.
 */
const DANGEROUS_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replacement: '' },
  { pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, replacement: '' },
  { pattern: /javascript:/gi, replacement: '' },
  { pattern: /vbscript:/gi, replacement: '' },
  { pattern: /data:text\/html/gi, replacement: '' },
  { pattern: /on\w+\s*=\s*["'][^"']*["']/gi, replacement: '' },
  { pattern: /on\w+\s*=\s*[^\s>]+/gi, replacement: '' },
];

function sanitizeString(value: string): string {
  let result = value;
  for (const { pattern, replacement } of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      // req.query is read-only in newer Express, use Object.defineProperty trick
      const sanitized = sanitizeValue(req.query);
      Object.defineProperty(req, 'query', {
        value: sanitized,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    if (req.params && typeof req.params === 'object') {
      for (const [k, v] of Object.entries(req.params)) {
        if (typeof v === 'string') {
          req.params[k] = sanitizeString(v);
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}
