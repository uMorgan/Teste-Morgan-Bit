import type { PaginationMeta } from '../../types/api';
import { Button } from './Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Gera a janela de páginas visíveis: 1 … 4 5 [6] 7 8 … 20 */
function buildPageWindow(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
}

export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  if (total === 0) return null;

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center justify-between gap-4 text-sm text-slate-600 sm:justify-start">
        <span>
          <span className="font-medium">{firstItem}</span>–<span className="font-medium">{lastItem}</span> de{' '}
          <span className="font-medium">{total}</span>
        </span>
        <label className="flex items-center gap-2">
          <span className="hidden sm:inline">Por página</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-md border-0 py-1 pl-2 pr-7 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-500"
            aria-label="Itens por página"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Anterior
        </Button>

        {/* Números de página só a partir de sm; no mobile, indicador compacto */}
        <span className="text-sm text-slate-600 sm:hidden">
          {page} / {totalPages}
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {buildPageWindow(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                className={`min-w-[2rem] rounded-md px-2 py-1 text-sm ${
                  item === page ? 'bg-brand-600 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima ›
        </Button>
      </div>
    </nav>
  );
}
