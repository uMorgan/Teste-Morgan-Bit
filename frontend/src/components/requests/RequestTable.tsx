import type { ServiceRequest, User } from '../../types/api';
import { formatDate, formatRequestCode } from '../../utils/format';
import { canChangeStatus, canModifyRequest } from '../../utils/permissions';
import { CategoryBadge, StatusBadge } from '../ui/Badges';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface RequestTableProps {
  data: ServiceRequest[] | undefined;
  isLoading: boolean;
  user: User | null;
  onView: (req: ServiceRequest) => void;
  onStatusChange: (req: ServiceRequest) => void;
  onEdit: (req: ServiceRequest) => void;
  onDelete: (req: ServiceRequest) => void;
}

export function RequestTable({
  data,
  isLoading,
  user,
  onView,
  onStatusChange,
  onEdit,
  onDelete,
}: RequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3.5 sm:px-6">Código</th>
            <th className="px-4 py-3.5">Título</th>
            <th className="px-4 py-3.5">Categoria</th>
            <th className="px-4 py-3.5">Solicitante</th>
            <th className="px-4 py-3.5">Data</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 sm:px-6 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {isLoading && (!data || data.length === 0) ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500">
                <div className="flex justify-center items-center gap-2">
                  <Spinner className="w-5 h-5 text-brand-600" />
                  <span>Carregando solicitações...</span>
                </div>
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500">
                Nenhuma solicitação encontrada com os filtros aplicados.
              </td>
            </tr>
          ) : (
            data.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                <td className="px-4 py-3.5 sm:px-6 font-bold text-slate-700 whitespace-nowrap">
                  {formatRequestCode(req.id)}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs truncate" title={req.title}>
                  {req.title}
                </td>
                <td className="px-4 py-3.5">
                  <CategoryBadge category={req.category} />
                </td>
                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{req.requesterName}</td>
                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                  {formatDate(req.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-4 py-3.5 sm:px-6 text-right whitespace-nowrap space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(req)}
                    title="Consultar Detalhes"
                  >
                    Ver
                  </Button>

                  {canChangeStatus(user) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onStatusChange(req)}
                      title="Alterar Status da Solicitação"
                    >
                      Status
                    </Button>
                  )}

                  {canModifyRequest(user, req) && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(req)}
                        title="Editar Solicitação"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(req)}
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
  );
}
