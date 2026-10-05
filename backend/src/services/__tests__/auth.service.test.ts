import { UnauthorizedError } from '../../errors/AppError';
import type { User } from '../../models/user.model';
import type { IHashProvider } from '../../providers/hash.provider';
import type { ITokenProvider } from '../../providers/token.provider';
import type { IUserRepository } from '../../repositories/user.repository';
import { AuthService } from '../auth.service';

const USER: User = {
  id: 'user-1',
  name: 'João',
  email: 'joao@empresa.com',
  passwordHash: 'hashed',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService.login', () => {
  let users: jest.Mocked<IUserRepository>;
  let hash: jest.Mocked<IHashProvider>;
  let token: jest.Mocked<ITokenProvider>;
  let service: AuthService;

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn() };
    hash = { hash: jest.fn(), compare: jest.fn() };
    token = { sign: jest.fn().mockReturnValue('jwt-token'), verify: jest.fn() };
    service = new AuthService(users, hash, token);
  });

  it('retorna token e usuário sem o hash da senha', async () => {
    users.findByEmail.mockResolvedValue(USER);
    hash.compare.mockResolvedValue(true);

    const result = await service.login({ email: USER.email, password: 'Senha@123' });

    expect(result.token).toBe('jwt-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(token.sign).toHaveBeenCalledWith({ id: USER.id, role: USER.role });
  });

  it('rejeita senha incorreta', async () => {
    users.findByEmail.mockResolvedValue(USER);
    hash.compare.mockResolvedValue(false);

    await expect(service.login({ email: USER.email, password: 'errada' })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('rejeita e-mail inexistente, ainda executando o compare (mitiga timing attack)', async () => {
    users.findByEmail.mockResolvedValue(null);
    hash.compare.mockResolvedValue(false);

    await expect(service.login({ email: 'x@y.com', password: 'qualquer' })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(hash.compare).toHaveBeenCalledTimes(1);
  });
});
