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

router.use(authLimiter);

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3 }
 *               password: { type: string, minLength: 8 }
 *               fullName: { type: string }
 *     responses:
 *       201: { description: User created. Verification email sent. }
 *       400: { description: Validation error }
 *       409: { description: Email/username already exists }
 */
router.post('/signup', validate(signupSchema), authController.signup);

/**
 * @openapi
 * /api/auth/signin:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Signin successful, returns tokens }
 *       401: { description: Invalid credentials }
 */
router.post('/signin', validate(signinSchema), authController.signin);
router.post('/send-otp', authController.sendSignupOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/signin-username', authController.signinByUsername);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
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
