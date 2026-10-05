import { ForbiddenError, NotFoundError } from '../../errors/AppError';
import type { RequestStatus, ServiceRequest } from '../../models/service-request.model';
import type { AuthenticatedUser } from '../../models/user.model';
import type { IServiceRequestRepository } from '../../repositories/service-request.repository';
import { ServiceRequestService } from '../service-request.service';

const OWNER: AuthenticatedUser = { id: 'owner-id', role: 'USER' };
const OTHER_USER: AuthenticatedUser = { id: 'other-id', role: 'USER' };
const ADMIN: AuthenticatedUser = { id: 'admin-id', role: 'ADMIN' };

function makeRequest(overrides: Partial<ServiceRequest> = {}): ServiceRequest {
  return {
    id: 1,
    title: 'Monitor quebrado',
    description: 'Tela piscando',
    category: 'TI',
    status: 'Aberto',
    userId: OWNER.id,
    requesterName: 'Dono',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    ...overrides,
  };
}

function makeRepositoryMock(): jest.Mocked<IServiceRequestRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };
}

const UPDATE_DATA = { title: 'Novo título', description: 'Nova descrição', category: 'RH' } as const;

describe('ServiceRequestService', () => {
  let repository: jest.Mocked<IServiceRequestRepository>;
  let service: ServiceRequestService;

  beforeEach(() => {
    repository = makeRepositoryMock();
    service = new ServiceRequestService(repository);
  });

  describe('create', () => {
    it("força status 'Aberto' e usa o id do usuário autenticado", async () => {
      repository.create.mockResolvedValue(makeRequest());

      await service.create({ title: 'T', description: 'D', category: 'TI' }, OWNER);

      expect(repository.create).toHaveBeenCalledWith({
        title: 'T',
        description: 'D',
        category: 'TI',
        status: 'Aberto',
        userId: OWNER.id,
      });
    });
  });

  describe('getById', () => {
    it('lança NotFoundError quando a solicitação não existe', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.getById(99)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('update', () => {
    it("atualiza quando status é 'Aberto' e o usuário é o dono, com guard de status", async () => {
      repository.findById.mockResolvedValue(makeRequest());
      repository.update.mockResolvedValue(makeRequest({ ...UPDATE_DATA }));

      const result = await service.update(1, UPDATE_DATA, OWNER);

      expect(repository.update).toHaveBeenCalledWith(1, UPDATE_DATA, { onlyIfStatus: 'Aberto' });
      expect(result.title).toBe(UPDATE_DATA.title);
    });

    it.each<RequestStatus>(['Em Atendimento', 'Concluído'])(
      "bloqueia edição quando status é '%s'",
      async (status) => {
        repository.findById.mockResolvedValue(makeRequest({ status }));

        await expect(service.update(1, UPDATE_DATA, OWNER)).rejects.toMatchObject({
          statusCode: 403,
          code: 'REQUEST_NOT_EDITABLE',
        });
        expect(repository.update).not.toHaveBeenCalled();
      },
    );

    it('bloqueia edição por usuário que não é dono nem admin', async () => {
      repository.findById.mockResolvedValue(makeRequest());

      await expect(service.update(1, UPDATE_DATA, OTHER_USER)).rejects.toMatchObject({
        code: 'NOT_REQUEST_OWNER',
      });
    });

    it('permite edição por ADMIN', async () => {
      repository.findById.mockResolvedValue(makeRequest());
      repository.update.mockResolvedValue(makeRequest());

      await expect(service.update(1, UPDATE_DATA, ADMIN)).resolves.toBeDefined();
    });

    it('lança erro se o status mudou entre a leitura e a escrita (race condition)', async () => {
      repository.findById.mockResolvedValue(makeRequest());
      repository.update.mockResolvedValue(null); // guard do UPDATE não casou

      await expect(service.update(1, UPDATE_DATA, OWNER)).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe('delete', () => {
    it("exclui quando status é 'Aberto'", async () => {
      repository.findById.mockResolvedValue(makeRequest());
      repository.delete.mockResolvedValue(true);

      await expect(service.delete(1, OWNER)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1, { onlyIfStatus: 'Aberto' });
    });

    it("bloqueia exclusão quando status não é 'Aberto'", async () => {
      repository.findById.mockResolvedValue(makeRequest({ status: 'Concluído' }));

      await expect(service.delete(1, OWNER)).rejects.toMatchObject({ code: 'REQUEST_NOT_EDITABLE' });
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('lança NotFoundError ao excluir solicitação inexistente', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.delete(1, OWNER)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('updateStatus', () => {
    it('ADMIN altera o status', async () => {
      repository.findById.mockResolvedValue(makeRequest());
      repository.updateStatus.mockResolvedValue(makeRequest({ status: 'Em Atendimento' }));

      const result = await service.updateStatus(1, 'Em Atendimento', ADMIN);

      expect(repository.updateStatus).toHaveBeenCalledWith(1, 'Em Atendimento');
      expect(result.status).toBe('Em Atendimento');
    });

    it('bloqueia usuário comum, mesmo sendo o dono', async () => {
      await expect(service.updateStatus(1, 'Concluído', OWNER)).rejects.toMatchObject({
        statusCode: 403,
        code: 'INSUFFICIENT_ROLE',
      });
      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('é idempotente quando o status já é o solicitado', async () => {
      repository.findById.mockResolvedValue(makeRequest({ status: 'Concluído' }));

      await service.updateStatus(1, 'Concluído', ADMIN);

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
