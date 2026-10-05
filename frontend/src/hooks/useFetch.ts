import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { getErrorMessage, isCanceledRequest } from '../utils/errors';

interface FetchState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Busca dados com cancelamento automático (AbortController) quando as
 * dependências mudam ou o componente desmonta — evita race conditions
 * (resposta antiga sobrescrevendo a nova) e setState em componente desmontado.
 * Mantém o `data` anterior durante o recarregamento (sem "piscar" a tela).
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): FetchState<T> & { reload: () => void } {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, isLoading: true });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, isLoading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledRequest(error)) return;
        setState((prev) => ({ ...prev, error: getErrorMessage(error), isLoading: false }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}
