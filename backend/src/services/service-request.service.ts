import { ForbiddenError, NotFoundError } from '../errors/AppError';
import {
  INITIAL_REQUEST_STATUS,
  type PaginatedResult,
  type RequestCategory,
  type RequestStatus,
  type ServiceRequest,
  type ServiceRequestFilters,
  type UpdateServiceRequestData,
} from '../models/service-request.model';
import type { AuthenticatedUser } from '../models/user.model';
import type { IServiceRequestRepository } from '../repositories/service-request.repository';

export interface CreateServiceRequestInput {
  title: string;
  description: string;
  category: RequestCategory;
}

const EDITABLE_STATUS: RequestStatus = 'Aberto';

export class ServiceRequestService {
  constructor(private readonly repository: IServiceRequestRepository) {}

  list(filters: ServiceRequestFilters): Promise<PaginatedResult<ServiceRequest>> {
    return this.repository.findAll(filters);
  }

  async getById(id: number): Promise<ServiceRequest> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundError(`Solicitação #${id} não encontrada`);
    }
    return request;
  }

  /**
   * status e userId NUNCA vêm do cliente: o status é sempre o inicial
   * e o solicitante é o usuário do token.
   */
  create(input: CreateServiceRequestInput, actor: AuthenticatedUser): Promise<ServiceRequest> {
    return this.repository.create({
      title: input.title,
      description: input.description,
      category: input.category,
      status: INITIAL_REQUEST_STATUS,
      userId: actor.id,
    });
  }

  async update(
    id: number,
    data: UpdateServiceRequestData,
    actor: AuthenticatedUser,
  ): Promise<ServiceRequest> {
    const current = await this.getById(id);
    this.ensureCanModify(current, actor, 'editada');

    // O guard repete a checagem de status dentro do próprio UPDATE,
    // cobrindo a janela entre a leitura acima e a escrita (race condition).
    const updated = await this.repository.update(id, data, { onlyIfStatus: EDITABLE_STATUS });
    if (!updated) {
      throw this.notEditableError('editada');
    }
    return updated;
  }

  async delete(id: number, actor: AuthenticatedUser): Promise<void> {
    const current = await this.getById(id);
    this.ensureCanModify(current, actor, 'excluída');

    const deleted = await this.repository.delete(id, { onlyIfStatus: EDITABLE_STATUS });
    if (!deleted) {
      throw this.notEditableError('excluída');
    }
  }

  async updateStatus(id: number, status: RequestStatus, actor: AuthenticatedUser): Promise<ServiceRequest> {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenError('Apenas administradores podem alterar o status', 'INSUFFICIENT_ROLE');
    }

    const current = await this.getById(id);
    if (current.status === status) {
      return current; // idempotente: nada a alterar
    }

    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      // Removida entre a leitura e a escrita
      throw new NotFoundError(`Solicitação #${id} não encontrada`);
    }
    return updated;
  }

  /**
   * Regras para editar/excluir:
   *  1. Apenas o próprio solicitante ou um ADMIN.
   *  2. Apenas enquanto o status for 'Aberto'.
   */
  private ensureCanModify(request: ServiceRequest, actor: AuthenticatedUser, action: string): void {
    const isOwner = request.userId === actor.id;
    const isAdmin = actor.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError(
        `Apenas o solicitante ou um administrador pode ter esta solicitação ${action}`,
        'NOT_REQUEST_OWNER',
      );
    }

    if (request.status !== EDITABLE_STATUS) {
      throw this.notEditableError(action, request.status);
    }
  }

  private notEditableError(action: string, currentStatus?: RequestStatus): ForbiddenError {
    const statusInfo = currentStatus ? ` (status atual: '${currentStatus}')` : '';
    return new ForbiddenError(
      `A solicitação só pode ser ${action} enquanto estiver com status '${EDITABLE_STATUS}'${statusInfo}`,
      'REQUEST_NOT_EDITABLE',
    );
  }
}
