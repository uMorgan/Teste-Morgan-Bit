import { useCallback, useState } from 'react';
import { RequestDetailsModal } from '../components/modals/RequestDetailsModal';
import { RequestFormModal } from '../components/modals/RequestFormModal';
import { StatusChangeModal } from '../components/modals/StatusChangeModal';
import { RequestFilterBar } from '../components/requests/RequestFilterBar';
import { RequestTable } from '../components/requests/RequestTable';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { requestService } from '../services/request.service';
import type { RequestFilters, ServiceRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { formatRequestCode } from '../utils/format';
import { canChangeStatus } from '../utils/permissions';

export function RequestsListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Estado dos Filtros
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [filters, setFilters] = useState<RequestFilters>({
    page: 1,
    limit: 10,
    category: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  // Estado dos Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);

  const [viewingRequest, setViewingRequest] = useState<ServiceRequest | null>(null);
  const [statusChangingRequest, setStatusChangingRequest] = useState<ServiceRequest | null>(null);

  const [deletingRequest, setDeletingRequest] = useState<ServiceRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Busca de Dados Assíncrona
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      requestService.list({ ...filters, search: debouncedSearch || undefined }, signal),
    [
      filters.page,
      filters.limit,
      filters.category,
      filters.status,
      filters.startDate,
      filters.endDate,
      debouncedSearch,
    ],
  );

  const { data: result, isLoading, error, reload } = useFetch(fetcher, [fetcher]);

  // Handlers de Ação
  const handleOpenCreate = () => {
    setEditingRequest(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (req: ServiceRequest) => {
    setEditingRequest(req);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRequest) return;
    setIsDeleting(true);
    try {
      await requestService.remove(deletingRequest.id);
      showToast(`Solicitação ${formatRequestCode(deletingRequest.id)} excluída com sucesso!`);
      setDeletingRequest(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilters({
      page: 1,
      limit: 10,
      category: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Solicitações</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulte, filtre e gerencie todas as solicitações registradas no sistema
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Nova Solicitação
        </Button>
      </div>

      {/* Componente da Barra de Filtros */}
      <RequestFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Tabela de Dados e Paginação */}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
          <RequestTable
            data={result?.data}
            isLoading={isLoading}
            user={user}
            onView={setViewingRequest}
            onStatusChange={setStatusChangingRequest}
            onEdit={handleOpenEdit}
            onDelete={setDeletingRequest}
          />

          {result && (
            <Pagination
              meta={result.meta}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              onLimitChange={(limit) => setFilters((f) => ({ ...f, page: 1, limit }))}
            />
          )}
        </div>
      )}

      {/* Modais da Página */}
      <RequestFormModal
        open={isFormOpen}
        requestToEdit={editingRequest}
        onClose={() => setIsFormOpen(false)}
        onSuccess={reload}
      />

      <RequestDetailsModal
        request={viewingRequest}
        onClose={() => setViewingRequest(null)}
        canChangeStatus={canChangeStatus(user)}
        onOpenStatusChange={() => {
          setStatusChangingRequest(viewingRequest);
          setViewingRequest(null);
        }}
      />

      <StatusChangeModal
        request={statusChangingRequest}
        onClose={() => setStatusChangingRequest(null)}
        onSuccess={reload}
      />

      <Modal
        open={!!deletingRequest}
        onClose={() => setDeletingRequest(null)}
        title="Confirmar Exclusão"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingRequest(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Tem certeza que deseja excluir a solicitação{' '}
          <strong className="text-slate-900">
            {deletingRequest && formatRequestCode(deletingRequest.id)} - {deletingRequest?.title}
          </strong>
          ? Esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
