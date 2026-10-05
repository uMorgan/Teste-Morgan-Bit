/**
 * Contratos da API — espelham os tipos do backend (backend/src/models).
 * Datas chegam serializadas como string ISO 8601.
 */

export const REQUEST_CATEGORIES = ['TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura'] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const REQUEST_STATUSES = ['Aberto', 'Em Atendimento', 'Concluído'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category: RequestCategory;
  status: RequestStatus;
  userId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestFormData {
  title: string;
  description: string;
  category: RequestCategory;
}

export interface RequestFilters {
  startDate?: string;
  endDate?: string;
  category?: RequestCategory;
  status?: RequestStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DashboardSummary {
  total: number;
  abertas: number;
  emAtendimento: number;
  concluidas: number;
}

/** Formato padronizado de erro devolvido pelo error.middleware do backend. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string | null; message: string }>;
  };
}
