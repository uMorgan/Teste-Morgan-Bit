import type { AuthenticatedUser } from '../models/user.model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Preenchido pelo auth.middleware em rotas protegidas. */
      user?: AuthenticatedUser;
    }
  }
}

export {};
