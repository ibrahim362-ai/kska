import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function signup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.signup(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Signup successful. Check email for verification.', data: result });
  } catch (error) {
    next(error);
  }
}

export async function signin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.signin(req.body);
    sendSuccess({ res, message: 'Signin successful', data: result });
  } catch (error) {
    next(error);
  }
}

export async function signinByUsername(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.signinByUsername(req.body);
    sendSuccess({ res, message: 'Signin successful', data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess({ res, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.body);
    sendSuccess({ res, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.verifyEmail(req.body.code);
    sendSuccess({ res, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken);
    sendSuccess({ res, message: 'Token refreshed', data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    sendSuccess({ res, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess({ res, data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user!.userId, req.body);
    sendSuccess({ res, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

export async function adminRegister(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.adminRegister(req.body);
    sendSuccess({ res, statusCode: 201, message: 'User created', data: result });
  } catch (error) {
    next(error);
  }
}

export async function sendSignupOtp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.sendSignupOtp(req.body.email);
    sendSuccess({ res, message: 'OTP sent', data: result });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyOtp(req.body.email, req.body.code);
    sendSuccess({ res, message: 'OTP verified', data: result });
  } catch (error) {
    next(error);
  }
}
