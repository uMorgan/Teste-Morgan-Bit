import type {
  Paginated,
  RequestFilters,
  RequestFormData,
  RequestStatus,
  ServiceRequest,
} from '../types/api';
import { api } from './api';

/** Remove filtros vazios para não poluir a query string. */
function toQueryParams(filters: RequestFilters): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string | number>;
}

export const requestService = {
  async list(filters: RequestFilters, signal?: AbortSignal): Promise<Paginated<ServiceRequest>> {
    const { data } = await api.get<Paginated<ServiceRequest>>('/requests', {
      params: toQueryParams(filters),
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<ServiceRequest> {
    const { data } = await api.get<ServiceRequest>(`/requests/${id}`, { signal });
    return data;
  },

  async create(payload: RequestFormData): Promise<ServiceRequest> {
    const { data } = await api.post<ServiceRequest>('/requests', payload);
    return data;
  },

  async update(id: number, payload: RequestFormData): Promise<ServiceRequest> {
    const { data } = await api.put<ServiceRequest>(`/requests/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/requests/${id}`);
  },

  async updateStatus(id: number, status: RequestStatus): Promise<ServiceRequest> {
    const { data } = await api.patch<ServiceRequest>(`/requests/${id}/status`, { status });
    return data;
  },
};
