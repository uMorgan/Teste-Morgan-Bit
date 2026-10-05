import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { requestService } from '../../services/request.service';
import type { RequestCategory, RequestFormData, ServiceRequest } from '../../types/api';
import { REQUEST_CATEGORIES } from '../../types/api';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { Button } from '../ui/Button';
import { SelectField, TextAreaField, TextField } from '../ui/FormFields';
import { Modal } from '../ui/Modal';

interface RequestFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestToEdit?: ServiceRequest | null;
}

export function RequestFormModal({ open, onClose, onSuccess, requestToEdit }: RequestFormModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    description: '',
    category: 'TI',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestToEdit) {
      setFormData({
        title: requestToEdit.title,
        description: requestToEdit.description,
        category: requestToEdit.category,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'TI',
      });
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [requestToEdit, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      if (requestToEdit) {
        await requestService.update(requestToEdit.id, formData);
        showToast('Solicitação atualizada com sucesso!');
      } else {
        await requestService.create(formData);
        showToast('Solicitação criada com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errors = getFieldErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setGeneralError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={requestToEdit ? `Editar Solicitação #${requestToEdit.id}` : 'Nova Solicitação'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {requestToEdit ? 'Salvar Alterações' : 'Criar Solicitação'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
            {generalError}
          </div>
        )}

        <TextField
          label="Título"
          placeholder="Ex: Troca de teclado com defeito"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={fieldErrors.title}
          required
        />

        <SelectField
          label="Categoria"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as RequestCategory })}
          error={fieldErrors.category}
        >
          {REQUEST_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </SelectField>

        <TextAreaField
          label="Descrição Detalhada"
          placeholder="Descreva a solicitação em detalhes para agilizar o atendimento..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={fieldErrors.description}
          required
        />
      </form>
    </Modal>
  );
}
