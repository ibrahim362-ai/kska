import { Request, Response } from 'express';
import { challengeService } from './challenge.service';
import prisma from '../../config/prisma';

export class ChallengeController {
  // Admin: Create challenge
  async createChallenge(req: Request, res: Response) {
    try {
      const { title, description, type, imageUrl, points, startsAt, endsAt, maxResponses } = req.body;
      
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized - user not authenticated' });
      }
      
      const creatorId = req.user.userId;

      if (!title || !description || !startsAt || !endsAt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const challenge = await challengeService.createChallenge({
        creatorId,
        title,
        description,
        type,
        imageUrl,
        points,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        maxResponses,
      });

      res.status(201).json({ success: true, data: challenge });
    } catch (error: any) {
      console.error('[ChallengeController] createChallenge error:', error);
      res.status(500).json({ error: error.message || 'Failed to create challenge' });
    }
  }

  // Admin: Get all challenges
  async getAllChallenges(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await challengeService.getAllChallenges(page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[ChallengeController] getAllChallenges error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch challenges' });
    }
  }

  // Admin: Update challenge
  async updateChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convert date strings to Date objects if present
      if (updates.startsAt) updates.startsAt = new Date(updates.startsAt);
      if (updates.endsAt) updates.endsAt = new Date(updates.endsAt);

      const challenge = await challengeService.updateChallenge(id, updates);

      res.json({ success: true, data: challenge });
    } catch (error: any) {
      console.error('[ChallengeController] updateChallenge error:', error);
      res.status(500).json({ error: error.message || 'Failed to update challenge' });
    }
  }

  // Admin: Delete challenge
  async deleteChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await challengeService.deleteChallenge(id);

      res.json({ success: true, message: 'Challenge deleted successfully' });
    } catch (error: any) {
      console.error('[ChallengeController] deleteChallenge error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete challenge' });
    }
  }

  // Admin: Get challenge stats
  async getChallengeStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const stats = await challengeService.getChallengeStats(id);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('[ChallengeController] getChallengeStats error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch challenge stats' });
    }
  }

  // Admin: Get challenge responses with user details
  async getChallengeResponses(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await challengeService.getChallengeResponses(id, page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[ChallengeController] getChallengeResponses error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch challenge responses' });
    }
  }

  // Admin: Award points to a user for their challenge response
  async awardPoints(req: Request, res: Response) {
    try {
      const { responseId } = req.params;
      const adminId = req.user!.userId;

      // Get the response with challenge details
      const response = await prisma.challengeResponse.findUnique({
        where: { id: responseId },
        include: {
          challenge: true,
          user: true,
        },
      });

      if (!response) {
        return res.status(404).json({ error: 'Challenge response not found' });
      }

      if (response.action !== 'ACCEPT') {
        return res.status(400).json({ error: 'Points can only be awarded for accepted challenges' });
      }

      if (response.pointsAwarded) {
        return res.status(400).json({ error: 'Points already awarded for this response' });
      }

      // Award points to user
      const pointsToAward = response.challenge.points;

      // Update user icons
      await prisma.user.update({
        where: { id: response.userId },
        data: { icons: { increment: pointsToAward } },
      });

      // Create icon transaction
      await prisma.iconTransaction.create({
        data: {
          userId: response.userId,
          amount: pointsToAward,
          type: 'CHALLENGE_COMPLETE',
          description: `Completed challenge: ${response.challenge.title}`,
          metadata: JSON.stringify({
            challengeId: response.challengeId,
            responseId: response.id,
            awardedBy: adminId,
          }),
        },
      });

      // Update response to mark as awarded
      const updatedResponse = await prisma.challengeResponse.update({
        where: { id: responseId },
        data: {
          pointsAwarded: true,
          awardedAt: new Date(),
          awardedBy: adminId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              icons: true,
            },
          },
          challenge: {
            select: {
              id: true,
              title: true,
              points: true,
            },
          },
        },
      });

      // Send notification to user
      await prisma.notification.create({
        data: {
          userId: response.userId,
          type: 'CHALLENGE_POINTS_AWARDED',
          title: 'Points Awarded! 🎉',
          message: `You earned ${pointsToAward} icons for completing "${response.challenge.title}"!`,
          data: JSON.stringify({
            challengeId: response.challengeId,
            responseId: response.id,
            pointsAwarded: pointsToAward,
          }),
        },
      });

      res.json({
        success: true,
        message: `${pointsToAward} points awarded successfully`,
        data: updatedResponse,
      });
    } catch (error: any) {
      console.error('[ChallengeController] awardPoints error:', error);
      res.status(500).json({ error: error.message || 'Failed to award points' });
    }
  }

  // Admin: Get only users who accepted the challenge
  async getChallengeAcceptors(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await challengeService.getChallengeAcceptors(id, page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[ChallengeController] getChallengeAcceptors error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch challenge acceptors' });
    }
  }

  // Mobile: Get active challenges for user
  async getActiveChallenges(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const challenges = await challengeService.getActiveChallengesForUser(userId);

      res.json({ success: true, data: challenges });
    } catch (error: any) {
      console.error('[ChallengeController] getActiveChallenges error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch active challenges' });
    }
  }

  // Mobile: Get user's challenge history
  async getUserChallengeHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await challengeService.getUserChallengeHistory(userId, page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[ChallengeController] getUserChallengeHistory error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch challenge history' });
    }
  }

  // Mobile: Respond to challenge
  async respondToChallenge(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const { action, content, mediaUrl } = req.body;
      const userId = req.user!.userId;

      if (!action || !['ACCEPT', 'REJECT', 'SKIP'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be ACCEPT, REJECT, or SKIP' });
      }

      // ✅ CHECK MEMBERSHIP ACCESS for ACCEPT action
      if (action === 'ACCEPT') {
        // Get user's active membership
        const userMembership = await prisma.userMembership.findFirst({
          where: {
            userId,
            isActive: true,
            expiresAt: { gt: new Date() },
          },
          include: {
            membership: true,
          },
          orderBy: {
            membership: {
              level: 'desc', // Get highest level membership
            },
          },
        });

        // Check if user has challenge access
        if (!userMembership || !userMembership.membership.challengeAccess) {
          return res.status(403).json({
            error: 'Upgrade to SILVER or higher to accept challenges',
            requiresUpgrade: true,
            minimumLevel: 'SILVER',
          });
        }
      }

      const response = await challengeService.respondToChallenge({
        challengeId,
        userId,
        action,
        content,
        mediaUrl,
      });

      res.status(201).json({ success: true, data: response });
    } catch (error: any) {
      console.error('[ChallengeController] respondToChallenge error:', error);
      res.status(400).json({ error: error.message || 'Failed to respond to challenge' });
    }
  }
}

export const challengeController = new ChallengeController();
