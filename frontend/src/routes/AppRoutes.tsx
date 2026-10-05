import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { RequestsListPage } from '../pages/RequestsListPage';

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rota Pública */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/solicitacoes" element={<RequestsListPage />} />
      </Route>

      {/* Redirecionamento Padrão */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
