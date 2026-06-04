import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { AuthRequest } from './auth';

const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EMPLOYER: 3,
  USER: 1,
};

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const hasPermission = allowedRoles.some(
      (role) => userRoleLevel >= (ROLE_HIERARCHY[role] || 0)
    );

    if (!hasPermission) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
