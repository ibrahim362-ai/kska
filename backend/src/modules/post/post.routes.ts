import { Router } from 'express';
import * as postController from './post.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { createPostSchema, updatePostSchema, postQuerySchema, createCommentSchema } from '../../validations/post';

const router = Router();

router.get('/', optionalAuth, validate(postQuerySchema, 'query'), postController.getPosts);
router.get('/trending', optionalAuth, postController.getTrendingPosts);
router.get('/saved', authenticate, postController.getSavedPosts);
router.post('/', authenticate, (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    upload.single('media')(req, res, next);
  } else {
    next();
  }
}, validate(createPostSchema), postController.createPost);

router.get('/reports/list', authenticate, authorize('ADMIN'), postController.getReports);
router.put('/reports/:id', authenticate, authorize('ADMIN'), postController.updateReportStatus);

router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authenticate, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/comments', authenticate, validate(createCommentSchema), postController.addComment);
router.get('/:id/comments', optionalAuth, postController.getComments);
router.delete('/:id/comments/:commentId', authenticate, postController.deleteComment);

router.post('/:id/report', authenticate, postController.reportPost);
router.post('/:id/save', authenticate, postController.savePost);

router.post('/calculate-trending', authenticate, authorize('ADMIN'), postController.calculateTrending);

export default router;
