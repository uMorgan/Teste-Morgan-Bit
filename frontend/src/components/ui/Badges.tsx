import type { RequestStatus } from '../../types/api';

const STATUS_CONFIG: Record<RequestStatus, { bg: string; text: string; ring: string; dot: string }> = {
  Aberto: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    ring: 'ring-amber-600/30',
    dot: 'bg-amber-500',
  },
  'Em Atendimento': {
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    ring: 'ring-sky-600/30',
    dot: 'bg-sky-500',
  },
  Concluído: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    ring: 'ring-emerald-600/30',
    dot: 'bg-emerald-500',
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Aberto;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset transition-colors duration-150 ${config.bg} ${config.text} ${config.ring}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 transition-colors duration-150 border border-slate-200/60">
      {category}
    </span>
  );
}
