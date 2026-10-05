import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import type { AuthenticatedUser } from '../models/user.model';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 não captura rejeições de Promises. Este wrapper encaminha
 * qualquer erro assíncrono para o errorMiddleware via next(err).
 */
export const asyncHandler =
  (handler: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

/** Obtém o usuário autenticado de forma tipada (non-null) nos controllers. */
export function getAuthUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    // Só acontece se a rota foi registrada sem o authMiddleware (erro de programação)
    throw new UnauthorizedError();
  }
  return req.user;
}
