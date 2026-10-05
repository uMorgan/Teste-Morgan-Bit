import type { RequestStatus } from '../../types/api';

const STATUS_STYLES: Record<RequestStatus, string> = {
  Aberto: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  'Em Atendimento': 'bg-sky-50 text-sky-800 ring-sky-600/20',
  Concluído: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {category}
    </span>
  );
}
