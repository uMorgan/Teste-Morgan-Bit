import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brand-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Portal de Solicitações</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/solicitacoes"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/solicitacoes')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Solicitações
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user.email} • <span className="font-semibold text-brand-600">{user.role}</span></p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-slate-200"
                  title="Sair do sistema"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu mobile de navegação secundária */}
      <div className="sm:hidden flex border-t border-slate-100 bg-slate-50 px-4 py-2 gap-2">
        <Link
          to="/dashboard"
          className={`flex-1 text-center py-1.5 rounded text-xs font-semibold ${
            isActive('/dashboard') ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/solicitacoes"
          className={`flex-1 text-center py-1.5 rounded text-xs font-semibold ${
            isActive('/solicitacoes') ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Solicitações
        </Link>
      </div>
    </header>
  );
}
