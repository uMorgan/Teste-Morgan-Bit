import { useCallback, useState } from 'react';
import { RequestDetailsModal } from '../components/modals/RequestDetailsModal';
import { RequestFormModal } from '../components/modals/RequestFormModal';
import { StatusChangeModal } from '../components/modals/StatusChangeModal';
import { CategoryBadge, StatusBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { SelectField, TextField } from '../components/ui/FormFields';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { requestService } from '../services/request.service';
import type { RequestCategory, RequestFilters, RequestStatus, ServiceRequest } from '../types/api';
import { REQUEST_CATEGORIES, REQUEST_STATUSES } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatRequestCode } from '../utils/format';
import { canChangeStatus, canModifyRequest } from '../utils/permissions';

export function RequestsListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Filtros
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

  // Modais de estado
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);

  const [viewingRequest, setViewingRequest] = useState<ServiceRequest | null>(null);
  const [statusChangingRequest, setStatusChangingRequest] = useState<ServiceRequest | null>(null);

  const [deletingRequest, setDeletingRequest] = useState<ServiceRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Busca dados do backend
  const activeFilters = { ...filters, search: debouncedSearch || undefined };
  const fetcher = useCallback(
    (signal: AbortSignal) => requestService.list(activeFilters, signal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Solicitações</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulte, filtre e gerencie todas as solicitações registradas
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Nova Solicitação
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca textual */}
          <div className="lg:col-span-1">
            <TextField
              label="Buscar por título"
              placeholder="Digite palavra-chave..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
            />
          </div>

          {/* Categoria */}
          <div>
            <SelectField
              label="Categoria"
              value={filters.category || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  category: (e.target.value as RequestCategory) || undefined,
                }))
              }
            >
              <option value="">Todas as categorias</option>
              {REQUEST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Status */}
          <div>
            <SelectField
              label="Status"
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  status: (e.target.value as RequestStatus) || undefined,
                }))
              }
            >
              <option value="">Todos os status</option>
              {REQUEST_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Período Início */}
          <div>
            <TextField
              label="Data Inicial"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, page: 1, startDate: e.target.value || undefined }))
              }
            />
          </div>

          {/* Período Fim */}
          <div>
            <TextField
              label="Data Final"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, page: 1, endDate: e.target.value || undefined }))
              }
            />
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {(search || filters.category || filters.status || filters.startDate || filters.endDate) && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              ✕ Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Dados */}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {isLoading && !result ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <Spinner className="w-5 h-5 text-brand-600" />
                        <span>Carregando solicitações...</span>
                      </div>
                    </td>
                  </tr>
                ) : result?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      Nenhuma solicitação encontrada com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  result?.data.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-700 whitespace-nowrap">
                        {formatRequestCode(req.id)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                        {req.title}
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={req.category} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {req.requesterName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        {/* Botão Ver Detalhes */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingRequest(req)}
                          title="Consultar Detalhes"
                        >
                          Ver
                        </Button>

                        {/* Botão Alterar Status (Admin) */}
                        {canChangeStatus(user) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setStatusChangingRequest(req)}
                            title="Alterar Status da Solicitação"
                          >
                            Status
                          </Button>
                        )}

                        {/* Botões Editar / Excluir (Dono ou Admin quando Aberto) */}
                        {canModifyRequest(user, req) && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenEdit(req)}
                              title="Editar Solicitação"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingRequest(req)}
                              title="Excluir Solicitação"
                            >
                              Excluir
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {result && (
            <Pagination
              meta={result.meta}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              onLimitChange={(limit) => setFilters((f) => ({ ...f, page: 1, limit }))}
            />
          )}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      <RequestFormModal
        open={isFormOpen}
        requestToEdit={editingRequest}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => reload()}
      />

      {/* Modal Detalhes */}
      <RequestDetailsModal
        request={viewingRequest}
        onClose={() => setViewingRequest(null)}
        canChangeStatus={canChangeStatus(user)}
        onOpenStatusChange={() => {
          setStatusChangingRequest(viewingRequest);
          setViewingRequest(null);
        }}
      />

      {/* Modal Troca de Status */}
      <StatusChangeModal
        request={statusChangingRequest}
        onClose={() => setStatusChangingRequest(null)}
        onSuccess={() => reload()}
      />

      {/* Modal de Confirmação de Exclusão */}
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
