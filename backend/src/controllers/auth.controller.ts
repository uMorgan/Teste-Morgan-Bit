import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service';
import { getAuthUser } from '../utils/http';
import { loginSchema } from '../validators/schemas';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const credentials = loginSchema.parse(req.body);
    const result = await this.authService.login(credentials);
    res.status(200).json(result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const { id } = getAuthUser(req);
    const user = await this.authService.getProfile(id);
    res.status(200).json(user);
  };

  /**
   * JWT é stateless: o logout efetivo é o cliente descartar o token.
   * O endpoint existe para manter o contrato da API explícito e como
   * ponto de extensão (ex.: blacklist de tokens em Redis).
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    res.status(204).send();
  };
}
