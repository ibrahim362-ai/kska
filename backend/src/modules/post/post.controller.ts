import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as postService from './post.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const post = await postService.createPost(req.user!.userId, { ...req.body, mediaUrl });
    sendSuccess({ res, statusCode: 201, message: 'Post created', data: post });
  } catch (error) {
    next(error);
  }
}

export async function getPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await postService.getPosts(req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getPostById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await postService.getPostById(String(req.params.id));
    sendSuccess({ res, data: post });
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await postService.updatePost(String(req.params.id), req.user!.userId, req.body);
    sendSuccess({ res, message: 'Post updated', data: post });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await postService.deletePost(String(req.params.id), req.user!.userId);
    sendSuccess({ res, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
}

export async function likePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await postService.likePost(req.user!.userId, String(req.params.id));
    sendSuccess({ res, message: result.message, data: result });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comment = await postService.addComment(req.user!.userId, String(req.params.id), req.body);
    sendSuccess({ res, statusCode: 201, message: 'Comment added', data: comment });
  } catch (error) {
    next(error);
  }
}

export async function getComments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comments = await postService.getComments(String(req.params.id));
    sendSuccess({ res, data: comments });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await postService.deleteComment(String(req.params.commentId), req.user!.userId);
    sendSuccess({ res, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
}

export async function reportPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await postService.reportPost(req.user!.userId, String(req.params.id), req.body.reason);
    sendSuccess({ res, statusCode: 201, message: 'Report submitted', data: report });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reports = await postService.getReports(req.query as any);
    sendSuccess({ res, data: reports.data, meta: reports.meta });
  } catch (error) {
    next(error);
  }
}

export async function updateReportStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await postService.updateReportStatus(String(req.params.id), req.body.status);
    sendSuccess({ res, message: 'Report updated', data: report });
  } catch (error) {
    next(error);
  }
}

export async function savePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await postService.savePost(req.user!.userId, String(req.params.id));
    sendSuccess({ res, message: result.message, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSavedPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await postService.getSavedPosts(req.user!.userId, req.query as any);
    sendSuccess({ res, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getTrendingPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const posts = await postService.getTrendingPosts(Number(req.query.limit) || 10);
    sendSuccess({ res, data: posts });
  } catch (error) {
    next(error);
  }
}

export async function calculateTrending(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await postService.calculateTrending();
    sendSuccess({ res, message: 'Trending calculated', data: result });
  } catch (error) {
    next(error);
  }
}
