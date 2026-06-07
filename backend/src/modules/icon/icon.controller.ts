import { Request, Response } from 'express';
import { IconService } from '../../services/icon.service';

// Async handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getMyIcons = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const balance = await IconService.getBalance(userId);
  
  res.json({ 
    success: true,
    data: { 
      icons: balance,
      userId 
    } 
  });
});

export const getMyIconTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { limit, offset, type } = req.query;
  
  const result = await IconService.getTransactions(userId, {
    limit: limit ? parseInt(limit as string) : 50,
    offset: offset ? parseInt(offset as string) : 0,
    type: type as string | undefined,
  });
  
  res.json({ 
    success: true,
    data: result.transactions,
    meta: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  });
});

export const getIconLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { limit, period } = req.query;
  
  const leaderboard = await IconService.getLeaderboard({
    limit: limit ? parseInt(limit as string) : 10,
    period: period as string | undefined,
  });
  
  res.json({ 
    success: true,
    data: leaderboard 
  });
});

export const getUserIcons = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const balance = await IconService.getBalance(userId);
  
  res.json({ 
    success: true,
    data: { 
      icons: balance,
      userId 
    } 
  });
});

// Admin only: Award icons manually
export const awardIconsManually = asyncHandler(async (req: Request, res: Response) => {
  const { userId, amount, description } = req.body;
  const adminId = (req as any).user.userId;
  
  const result = await IconService.awardIcons(
    userId,
    amount,
    'MANUAL',
    description || 'Manually awarded by admin',
    { awardedBy: adminId }
  );
  
  res.json({ 
    success: true,
    data: result 
  });
});

// Admin only: Deduct icons manually
export const deductIconsManually = asyncHandler(async (req: Request, res: Response) => {
  const { userId, amount, description } = req.body;
  const adminId = (req as any).user.userId;
  
  const result = await IconService.deductIcons(
    userId,
    amount,
    'MANUAL',
    description || 'Manually deducted by admin',
    { deductedBy: adminId }
  );
  
  res.json({ 
    success: true,
    data: result 
  });
});
