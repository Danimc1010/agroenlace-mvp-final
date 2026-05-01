import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LoadingSpinner } from './UI';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleRoute({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
