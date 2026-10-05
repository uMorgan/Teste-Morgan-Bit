import axios, { type AxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

const TOKEN_STORAGE_KEY = 'portal.accessToken';

/**
 * Encapsula o armazenamento do token. Trocar localStorage por cookie
 * (ou sessionStorage) no futuro exige mudar apenas este objeto.
 */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_STORAGE_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Callback registrado pelo AuthProvider para reagir a um 401
 * (limpar estado + redirecionar). Evita acoplar o Axios ao React Router.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

// REQUEST: injeta o JWT em toda chamada
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// RESPONSE: token expirado/inválido -> encerra a sessão globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isLoginAttempt = error.config?.url?.endsWith('/auth/login') ?? false;

    // No login, 401 significa "credenciais inválidas" e é tratado pelo formulário
    if (error.response?.status === 401 && !isLoginAttempt) {
      tokenStorage.clear();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);
