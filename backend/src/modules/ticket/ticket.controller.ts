import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as ticketService from './ticket.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function createTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.createTicket(req.user!.userId, req.body);
    sendSuccess({ res, statusCode: 201, message: 'Ticket created', data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function getTickets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.getTickets(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.getTicketById(String(req.params.id));
    sendSuccess({ res, data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.updateTicket(String(req.params.id), req.user!.userId, req.body);
    sendSuccess({ res, message: 'Ticket updated', data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await ticketService.deleteTicket(String(req.params.id), req.user!.userId);
    sendSuccess({ res, message: 'Ticket deleted' });
  } catch (error) {
    next(error);
  }
}

export async function purchaseTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const purchase = await ticketService.purchaseTicket(req.user!.userId, req.body.ticketId);
    sendSuccess({ res, statusCode: 201, message: 'Ticket purchased', data: purchase });
  } catch (error) {
    next(error);
  }
}

export async function getUserPurchases(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const purchases = await ticketService.getUserPurchases(req.user!.userId);
    sendSuccess({ res, data: purchases });
  } catch (error) {
    next(error);
  }
}

export async function checkInTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.checkInTicket(req.user!.userId, req.body.purchaseId);
    sendSuccess({ res, message: 'Check-in successful', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getTicketAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const analytics = await ticketService.getTicketAnalytics();
    sendSuccess({ res, data: analytics });
  } catch (error) {
    next(error);
  }
}

export async function getMyCheckIns(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const checkIns = await ticketService.getMyCheckIns(req.user!.userId);
    sendSuccess({ res, data: checkIns });
  } catch (error) {
    next(error);
  }
}

export async function getPdfTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pdf = await ticketService.generatePdfTicket(String(req.params.id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${req.params.id}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}

export async function requestRefund(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refund = await ticketService.requestRefund(req.user!.userId, String(req.params.id), req.body.reason);
    sendSuccess({ res, statusCode: 201, message: 'Refund requested', data: refund });
  } catch (error) {
    next(error);
  }
}

export async function processRefund(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refund = await ticketService.processRefund(req.user!.userId, String(req.params.id), req.body.status);
    sendSuccess({ res, message: 'Refund processed', data: refund });
  } catch (error) {
    next(error);
  }
}

export async function getRefunds(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.getRefunds(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function transferTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfer = await ticketService.transferTicket(req.user!.userId, String(req.params.id), req.body.toUserId);
    sendSuccess({ res, statusCode: 201, message: 'Ticket transferred', data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function getTransfers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.getTransfers(req.user!.userId, req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}
