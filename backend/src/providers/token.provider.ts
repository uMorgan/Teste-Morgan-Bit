import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { USER_ROLES, type AuthenticatedUser, type UserRole } from '../models/user.model';

export interface ITokenProvider {
  sign(user: AuthenticatedUser): string;
  /** Lança erro se o token for inválido, expirado ou malformado. */
  verify(token: string): AuthenticatedUser;
}

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

function isAccessTokenPayload(payload: string | JwtPayload): payload is AccessTokenPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.sub === 'string' &&
    typeof payload.role === 'string' &&
    (USER_ROLES as readonly string[]).includes(payload.role)
  );
}

export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(user: AuthenticatedUser): string {
    const options: SignOptions = {
      subject: user.id,
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
      algorithm: 'HS256',
    };
    return jwt.sign({ role: user.role }, this.secret, options);
  }

  verify(token: string): AuthenticatedUser {
    // Fixar o algoritmo evita ataques de "algorithm confusion" (ex.: alg: none)
    const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });

    if (!isAccessTokenPayload(payload)) {
      throw new Error('Payload do token inválido');
    }

    return { id: payload.sub, role: payload.role };
  }
}
