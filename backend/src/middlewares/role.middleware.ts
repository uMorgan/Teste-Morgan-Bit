import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import type { UserRole } from '../models/user.model';

/**
 * Autorização por papel. Deve ser registrado DEPOIS do authMiddleware.
 * Ex.: router.patch('/:id/status', requireRole('ADMIN'), handler)
 */
export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Você não tem permissão para executar esta ação', 'INSUFFICIENT_ROLE'));
    }
    return next();
  };
}
