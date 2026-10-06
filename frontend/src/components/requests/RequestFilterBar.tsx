import type { RequestCategory, RequestFilters, RequestStatus } from '../../types/api';
import { REQUEST_CATEGORIES, REQUEST_STATUSES } from '../../types/api';
import { SelectField, TextField } from '../ui/FormFields';

interface RequestFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: RequestFilters;
  onFiltersChange: (updater: (prev: RequestFilters) => RequestFilters) => void;
  onClearFilters: () => void;
}

export function RequestFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
}: RequestFilterBarProps) {
  const hasActiveFilters = Boolean(
    search || filters.category || filters.status || filters.startDate || filters.endDate,
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 transition-all duration-200 hover:border-slate-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Busca por título */}
        <div>
          <TextField
            label="Buscar por título"
            placeholder="Digite palavra-chave..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onFiltersChange((f) => ({ ...f, page: 1 }));
            }}
          />
        </div>

        {/* Categoria */}
        <div>
          <SelectField
            label="Categoria"
            value={filters.category || ''}
            onChange={(e) =>
              onFiltersChange((f) => ({
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
              onFiltersChange((f) => ({
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
              onFiltersChange((f) => ({ ...f, page: 1, startDate: e.target.value || undefined }))
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
              onFiltersChange((f) => ({ ...f, page: 1, endDate: e.target.value || undefined }))
            }
          />
        </div>
      </div>

      {/* Botão de limpar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors duration-150 py-1 px-2 rounded-md hover:bg-brand-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
