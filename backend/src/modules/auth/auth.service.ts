import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/tokens';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors';
import { sendEmail, getVerificationEmailHtml } from '../../utils/email';

export async function signup(data: {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  code?: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (existing) {
    throw new ConflictError(existing.email === data.email ? 'Email already registered' : 'Username already taken');
  }

  if (data.code) {
    const verification = await prisma.verification.findFirst({
      where: {
        code: data.code,
        type: 'SIGNUP_OTP',
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) throw new BadRequestError('Invalid or expired verification code');
    await prisma.verification.delete({ where: { id: verification.id } });
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
      isVerified: !!data.code,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshTokenStr = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenStr,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken: refreshTokenStr,
  };
}

export async function signin(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.isBanned) throw new UnauthorizedError('Account is banned');

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshTokenStr = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenStr,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken: refreshTokenStr,
  };
}

export async function signinByUsername(data: { username: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { username: data.username } });
  if (!user) throw new UnauthorizedError('Invalid username or password');
  if (user.isBanned) throw new UnauthorizedError('Account is banned');

  if (user.role !== 'EMPLOYER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new UnauthorizedError('Only employer accounts can access this app');
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid username or password');

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshTokenStr = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenStr,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken: refreshTokenStr,
  };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.verification.create({
    data: {
      userId: user.id,
      code: resetCode,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendEmail(email, 'Password Reset', getVerificationEmailHtml(resetCode));
}

export async function resetPassword(data: { token: string; newPassword: string }) {
  const verification = await prisma.verification.findFirst({
    where: {
      code: data.token,
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification || !verification.userId) throw new BadRequestError('Invalid or expired reset code');

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: verification.userId },
    data: { password: hashedPassword },
  });

  await prisma.verification.delete({ where: { id: verification.id } });
}

export async function verifyEmail(code: string) {
  const verification = await prisma.verification.findFirst({
    where: {
      code,
      type: 'EMAIL_VERIFICATION',
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification || !verification.userId) throw new BadRequestError('Invalid verification code');

  await prisma.user.update({
    where: { id: verification.userId },
    data: { isVerified: true },
  });

  await prisma.verification.delete({ where: { id: verification.id } });
}

export async function refreshTokens(token: string) {
  try {
    const decoded = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new UnauthorizedError('User not found');

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') throw new UnauthorizedError('Invalid refresh token');
    throw error;
  }
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
    bio: user.bio,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const valid = await bcrypt.compare(data.currentPassword, user.password);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
}

export async function adminRegister(data: {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (existing) {
    throw new ConflictError(existing.email === data.email ? 'Email already registered' : 'Username already taken');
  }

  const validRoles = ['USER', 'EMPLOYER', 'ADMIN'];
  if (!validRoles.includes(data.role)) {
    throw new BadRequestError('Invalid role');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role,
      isVerified: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function sendSignupOtp(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.verification.create({
    data: {
      code,
      type: 'SIGNUP_OTP',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendEmail(email, 'Your Verification Code', getVerificationEmailHtml(code));

  return { message: 'OTP sent to email' };
}

export async function verifyOtp(email: string, code: string) {
  const verification = await prisma.verification.findFirst({
    where: {
      code,
      expiresAt: { gt: new Date() },
      OR: [{ type: 'SIGNUP_OTP' }, { type: 'PASSWORD_RESET' }],
    },
  });

  if (!verification) {
    throw new BadRequestError('Invalid or expired OTP code');
  }

  return { verified: true, message: 'OTP verified successfully' };
}
