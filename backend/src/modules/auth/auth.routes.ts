import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/role';
import { validate } from '../../middleware/validate';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimit';
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../../validations/auth';

const router = Router();

// Apply strict rate limiting only to authentication routes that need brute-force protection
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/signin', authLimiter, validate(signinSchema), authController.signin);
router.post('/send-otp', authLimiter, authController.sendSignupOtp);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/signin-username', authLimiter, authController.signinByUsername);

// Password reset routes with their own limiter
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Email verification
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// Token refresh and logout - no strict limiting (covered by general limiter)
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       200: { description: User object }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

router.post('/admin-register', authenticate, authorize('ADMIN'), authController.adminRegister);

export default router;
