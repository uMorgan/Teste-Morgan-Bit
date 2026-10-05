import axios from 'axios';
import type { ApiErrorBody } from '../types/api';

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorBody).error?.message === 'string'
  );
}

/** Converte qualquer erro (Axios, rede, JS) em mensagem amigável. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'O servidor demorou para responder. Tente novamente.'
        : 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    if (isApiErrorBody(error.response.data)) {
      return error.response.data.error.message;
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/** Extrai erros de validação por campo (VALIDATION_ERROR do backend). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || !isApiErrorBody(error.response?.data)) return {};

  const details = error.response.data.error.details ?? [];
  return details.reduce<Record<string, string>>((acc, detail) => {
    if (detail.field && !acc[detail.field]) acc[detail.field] = detail.message;
    return acc;
  }, {});
}

export function isCanceledRequest(error: unknown): boolean {
  return axios.isCancel(error);
}
