import jwt from 'jsonwebtoken';
import { config } from '../config';

export function generateAccessToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwt.accessSecret) as { userId: string; role: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
}
