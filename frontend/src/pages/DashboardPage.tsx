import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { RequestFormModal } from '../components/modals/RequestFormModal';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Spinner } from '../components/ui/Spinner';
import { useFetch } from '../hooks/useFetch';
import { dashboardService } from '../services/dashboard.service';

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetcher = useCallback((signal: AbortSignal) => dashboardService.getSummary(signal), []);
  const { data: summary, isLoading, error, reload } = useFetch(fetcher, []);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard de Indicadores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral em tempo real das solicitações do sistema
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nova Solicitação
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading && !summary ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8 text-brand-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card Total */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Geral
              </span>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">{summary?.total ?? 0}</span>
              <p className="text-xs text-slate-500 mt-1">Todas as solicitações registradas</p>
            </div>
          </div>

          {/* Card Abertas */}
          <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-amber-50/40 to-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Abertas
              </span>
              <div className="p-2.5 bg-amber-100/80 rounded-lg text-amber-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-amber-900">{summary?.abertas ?? 0}</span>
              <p className="text-xs text-amber-700 mt-1">Aguardando início de atendimento</p>
            </div>
          </div>

          {/* Card Em Atendimento */}
          <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-sky-50/40 to-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Em Atendimento
              </span>
              <div className="p-2.5 bg-sky-100/80 rounded-lg text-sky-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-sky-900">{summary?.emAtendimento ?? 0}</span>
              <p className="text-xs text-sky-700 mt-1">Em processamento pelas equipes</p>
            </div>
          </div>

          {/* Card Concluídas */}
          <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-emerald-50/40 to-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Concluídas
              </span>
              <div className="p-2.5 bg-emerald-100/80 rounded-lg text-emerald-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-emerald-900">{summary?.concluidas ?? 0}</span>
              <p className="text-xs text-emerald-700 mt-1">Atendimentos finalizados</p>
            </div>
          </div>
        </div>
      )}

      {/* Seção de atalho rápido */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:border-slate-300">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Gerenciar Solicitações</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Acesse a lista completa para aplicar filtros detalhados, consultar históricos e atualizar status.
          </p>
        </div>
        <Link to="/solicitacoes">
          <Button variant="secondary">Ir para Listagem →</Button>
        </Link>
      </div>

      {/* Modal de cadastro */}
      <RequestFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => reload()}
      />
    </div>
  );
}
