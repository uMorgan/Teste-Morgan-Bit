import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import type { ITokenProvider } from '../providers/token.provider';

/**
 * Factory: recebe o provider por injeção (facilita testes e troca de estratégia).
 * Valida o header "Authorization: Bearer <token>" e injeta req.user = { id, role }.
 */
export function createAuthMiddleware(tokenProvider: ITokenProvider): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      return next(new UnauthorizedError('Token de autenticação não informado'));
    }

    const [scheme, token, ...rest] = header.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
      return next(new UnauthorizedError("Formato do token inválido. Use 'Bearer <token>'"));
    }

    try {
      req.user = tokenProvider.verify(token);
      return next();
    } catch {
      return next(new UnauthorizedError('Token inválido ou expirado'));
    }
  };
}
