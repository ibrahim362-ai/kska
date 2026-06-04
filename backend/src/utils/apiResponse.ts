import { Response } from 'express';

interface ApiResponseOptions {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess({ res, statusCode = 200, message = 'Success', data = null, meta }: ApiResponseOptions) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError({ res, statusCode = 500, message = 'Internal server error', data = null }: ApiResponseOptions) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}
