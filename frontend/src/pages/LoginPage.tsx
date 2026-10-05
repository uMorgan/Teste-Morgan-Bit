import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/FormFields';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errors';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sessionExpired = (location.state as { sessionExpired?: boolean })?.sessionExpired;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-brand-600">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Portal de Solicitações Internas
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Acesse sua conta para gerenciar e abrir chamados
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {sessionExpired && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md">
              Sua sessão expirou. Por favor, faça login novamente.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              type="email"
              placeholder="seu.email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded">
            <p className="font-semibold text-slate-700">Contas de teste pré-cadastradas:</p>
            <p>• Solicitante: <code className="bg-slate-200 px-1 rounded text-slate-800">joao.silva@empresa.com</code></p>
            <p>• Admin: <code className="bg-slate-200 px-1 rounded text-slate-800">admin@empresa.com</code></p>
            <p>• Senha padrão: <code className="bg-slate-200 px-1 rounded text-slate-800">Senha@123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
