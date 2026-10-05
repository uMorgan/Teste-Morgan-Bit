/**
 * Valores espelham exatamente os CHECK constraints de database/init.sql.
 * Fonte única de verdade no código: validators e services importam daqui.
 */
export const REQUEST_CATEGORIES = ['TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura'] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const REQUEST_STATUSES = ['Aberto', 'Em Atendimento', 'Concluído'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const INITIAL_REQUEST_STATUS: RequestStatus = 'Aberto';

/**
 * Entidade "Solicitação". Chamada de ServiceRequest para não colidir
 * com o tipo Request do Express.
 */
export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category: RequestCategory;
  status: RequestStatus;
  userId: string;
  requesterName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequestData {
  title: string;
  description: string;
  category: RequestCategory;
  userId: string;
  status: RequestStatus;
}

export interface UpdateServiceRequestData {
  title: string;
  description: string;
  category: RequestCategory;
}

export interface ServiceRequestFilters {
  startDate?: string; // YYYY-MM-DD (inclusivo)
  endDate?: string; // YYYY-MM-DD (inclusivo)
  category?: RequestCategory;
  status?: RequestStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  total: number;
  abertas: number;
  emAtendimento: number;
  concluidas: number;
}
