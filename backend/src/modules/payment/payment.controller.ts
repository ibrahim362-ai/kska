import { AuthRequest } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import * as chapaService from './chapa.service';
import * as telebirrService from './telebirr.service';
import { sendSuccess } from '../../utils/apiResponse';
import prisma from '../../config/prisma';

export async function createPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payment = await paymentService.createPayment(req.user!.userId, req.body);
    sendSuccess({ res, statusCode: 201, message: 'Payment created', data: payment });
  } catch (error) {
    next(error);
  }
}

export async function confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payment = await paymentService.confirmPayment(String(req.params.id), req.body);
    sendSuccess({ res, message: 'Payment confirmed', data: payment });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.getPayments(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getUserPayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payments = await paymentService.getUserPayments(req.user!.userId);
    sendSuccess({ res, data: payments });
  } catch (error) {
    next(error);
  }
}

export async function chapaInitialize(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new Error('User not found');

    const result = await chapaService.initializePayment({
      userId: req.user!.userId,
      amount: req.body.amount,
      currency: req.body.currency || 'ETB',
      email: user.email,
      fullName: user.fullName,
      callbackUrl: req.body.callbackUrl,
      returnUrl: req.body.returnUrl,
    });
    sendSuccess({ res, statusCode: 201, message: 'Chapa payment initialized', data: result });
  } catch (error) {
    next(error);
  }
}

export async function chapaVerify(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await chapaService.verifyPayment(String(req.params.txRef));
    sendSuccess({ res, message: 'Payment verified', data: result });
  } catch (error) {
    next(error);
  }
}

export async function chapaCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await chapaService.handleCallback(req.body);
    sendSuccess({ res, message: 'Callback processed', data: result });
  } catch (error) {
    next(error);
  }
}

export async function telebirrInitialize(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new Error('User not found');

    const result = await telebirrService.initializePayment({
      userId: req.user!.userId,
      amount: req.body.amount,
      email: user.email,
      fullName: user.fullName,
      phone: req.body.phone || user.phone,
      notifyUrl: req.body.notifyUrl,
      returnUrl: req.body.returnUrl,
    });
    sendSuccess({ res, statusCode: 201, message: 'Telebirr payment initialized', data: result });
  } catch (error) {
    next(error);
  }
}

export async function telebirrCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await telebirrService.handleCallback(req.body);
    sendSuccess({ res, message: 'Callback processed', data: result });
  } catch (error) {
    next(error);
  }
}

export async function telebirrQuery(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await telebirrService.queryPayment(String(req.params.txId));
    sendSuccess({ res, message: 'Payment queried', data: result });
  } catch (error) {
    next(error);
  }
}
