import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler, tokenStorage } from '../services/api';
import { authService } from '../services/auth.service';
import type { User } from '../types/api';

export interface AuthContextValue {
  user: User | null;
  /** true enquanto valida um token salvo (evita "piscar" a tela de login no F5). */
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(() => tokenStorage.get() !== null);

  // Restaura a sessão: se há token salvo, confirma com a API e busca o usuário
  useEffect(() => {
    if (!tokenStorage.get()) return;

    const controller = new AbortController();
    authService
      .me(controller.signal)
      .then(setUser)
      .catch(() => {
        if (!controller.signal.aborted) tokenStorage.clear();
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsInitializing(false);
      });

    return () => controller.abort();
  }, []);

  // Qualquer 401 da API (token expirado) encerra a sessão e volta ao login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate('/login', { replace: true, state: { sessionExpired: true } });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    tokenStorage.set(token);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // best-effort: o token é descartado de qualquer forma
    } catch {
      /* ignora falhas de rede no logout */
    } finally {
      tokenStorage.clear();
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitializing, login, logout }),
    [user, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
