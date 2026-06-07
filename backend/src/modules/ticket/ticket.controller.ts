import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as ticketService from './ticket.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function createTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Handle file upload - coverImage will be in req.file if uploaded
    // Use localhost:5000 for image URLs
    const data = {
      ...req.body,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      coverImage: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : undefined,
      // VIP options
      hasVipOption: req.body.hasVipOption === 'true',
      vipPrice: req.body.vipPrice ? Number(req.body.vipPrice) : undefined,
      vipPoints: req.body.vipPoints ? Number(req.body.vipPoints) : 30,
      // Family ticket
      familyTicket: req.body.familyTicket === 'true',
      maxFamilyMembers: req.body.maxFamilyMembers ? Number(req.body.maxFamilyMembers) : undefined,
      // Discount and points
      discount: req.body.discount ? Number(req.body.discount) : 0,
      pointsReward: req.body.pointsReward ? Number(req.body.pointsReward) : 0,
    };
    const ticket = await ticketService.createTicket(req.user!.userId, data);
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
    // Handle file upload for update as well
    // Use localhost:5000 for image URLs
    const data = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      quantity: req.body.quantity ? Number(req.body.quantity) : undefined,
      coverImage: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : undefined,
      // VIP options
      hasVipOption: req.body.hasVipOption !== undefined ? req.body.hasVipOption === 'true' : undefined,
      vipPrice: req.body.vipPrice ? Number(req.body.vipPrice) : undefined,
      vipPoints: req.body.vipPoints ? Number(req.body.vipPoints) : undefined,
      // Family ticket
      familyTicket: req.body.familyTicket !== undefined ? req.body.familyTicket === 'true' : undefined,
      maxFamilyMembers: req.body.maxFamilyMembers ? Number(req.body.maxFamilyMembers) : undefined,
      // Discount and points
      discount: req.body.discount !== undefined ? Number(req.body.discount) : undefined,
      pointsReward: req.body.pointsReward !== undefined ? Number(req.body.pointsReward) : undefined,
    };
    const ticket = await ticketService.updateTicket(String(req.params.id), req.user!.userId, data);
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
    const { 
      ticketId, 
      referralCode,
      isVip = false,
      isGift = false,
      recipientName,
      recipientPhone,
      recipientEmail,
      familyMembers // JSON string array of family member names
    } = req.body;
    
    const purchase = await ticketService.purchaseTicket(
      req.user!.userId, 
      ticketId, 
      referralCode,
      {
        isVip,
        isGift,
        recipientName,
        recipientPhone,
        recipientEmail,
        familyMembers
      }
    );
    
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
