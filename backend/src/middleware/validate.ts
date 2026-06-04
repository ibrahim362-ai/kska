import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);

      if (source === 'query') {
        Object.defineProperty(req, 'query', {
          value: data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else {
        Object.defineProperty(req, source, {
          value: data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestError(messages));
      } else {
        next(error);
      }
    }
  };
}
