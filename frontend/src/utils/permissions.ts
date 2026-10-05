import type { ServiceRequest, User } from '../types/api';

/**
 * Espelham as regras do backend APENAS para esconder/mostrar ações na UI.
 * A autorização real é sempre feita pela API.
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

/** Editar/Excluir: status 'Aberto' E (dono OU admin). */
export function canModifyRequest(user: User | null, request: ServiceRequest): boolean {
  if (!user || request.status !== 'Aberto') return false;
  return request.userId === user.id || user.role === 'ADMIN';
}

/** Alterar status: exclusivo de ADMIN. */
export function canChangeStatus(user: User | null): boolean {
  return isAdmin(user);
}
