import { NotFoundError, UnauthorizedError } from '../errors/AppError';
import { toPublicUser, type PublicUser } from '../models/user.model';
import type { IHashProvider } from '../providers/hash.provider';
import type { ITokenProvider } from '../providers/token.provider';
import type { IUserRepository } from '../repositories/user.repository';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

/**
 * Hash bcrypt válido de uma string aleatória. Usado quando o e-mail não existe
 * para que o tempo de resposta seja equivalente ao de uma senha errada,
 * dificultando a enumeração de usuários por timing.
 */
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.vP3q1bQ4i8b9R6KQ4o3J5b7S3a1e';

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async login({ email, password }: LoginInput): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    const passwordMatches = await this.hashProvider.compare(password, user?.passwordHash ?? DUMMY_HASH);

    // Mensagem genérica: não revela se o e-mail existe
    if (!user || !passwordMatches) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const token = this.tokenProvider.sign({ id: user.id, role: user.role });
    return { token, user: toPublicUser(user) };
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
    return toPublicUser(user);
  }
}
