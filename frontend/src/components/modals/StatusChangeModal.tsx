import { useState, type FormEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { requestService } from '../../services/request.service';
import type { RequestStatus, ServiceRequest } from '../../types/api';
import { REQUEST_STATUSES } from '../../types/api';
import { getErrorMessage } from '../../utils/errors';
import { formatRequestCode } from '../../utils/format';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/FormFields';
import { Modal } from '../ui/Modal';

interface StatusChangeModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatusChangeModal({ request, onClose, onSuccess }: StatusChangeModalProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<RequestStatus>(request?.status || 'Aberto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await requestService.updateStatus(request.id, status);
      showToast(`Status da solicitação ${formatRequestCode(request.id)} alterado para "${status}"!`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={`Alterar Status - ${formatRequestCode(request.id)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Atualizar Status
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="text-sm text-slate-600 mb-2">
          <strong>Título:</strong> {request.title}
        </div>

        <SelectField
          label="Novo Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as RequestStatus)}
        >
          {REQUEST_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </SelectField>
      </form>
    </Modal>
  );
}
