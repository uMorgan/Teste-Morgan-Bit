import type { ServiceRequest } from '../../types/api';
import { formatDateTime, formatRequestCode } from '../../utils/format';
import { CategoryBadge, StatusBadge } from '../ui/Badges';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface RequestDetailsModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onOpenStatusChange?: () => void;
  canChangeStatus?: boolean;
}

export function RequestDetailsModal({
  request,
  onClose,
  onOpenStatusChange,
  canChangeStatus = false,
}: RequestDetailsModalProps) {
  if (!request) return null;

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={`Detalhes da Solicitação ${formatRequestCode(request.id)}`}
      size="lg"
      footer={
        <div className="flex w-full justify-between items-center gap-2">
          <div>
            {canChangeStatus && onOpenStatusChange && (
              <Button variant="secondary" size="sm" onClick={onOpenStatusChange}>
                Alterar Status (Admin)
              </Button>
            )}
          </div>
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{request.title}</h3>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={request.status} />
            <CategoryBadge category={request.category} />
            <span className="text-xs text-slate-500">
              Criado em {formatDateTime(request.createdAt)}
            </span>
          </div>
        </div>

        <div className="border-t border-b border-slate-100 py-4 space-y-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Solicitante
            </span>
            <span className="text-slate-800 font-medium">{request.requesterName}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Descrição
            </span>
            <p className="text-slate-700 whitespace-pre-wrap mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-2">
            <div>
              <span className="font-semibold">Última atualização:</span>{' '}
              {formatDateTime(request.updatedAt)}
            </div>
            <div>
              <span className="font-semibold">Código do Usuário:</span> {request.userId}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
