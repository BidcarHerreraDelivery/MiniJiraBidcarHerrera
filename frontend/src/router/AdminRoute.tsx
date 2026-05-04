import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../features/auth/store/authStore';

export function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'admin') return <Navigate to="/board" replace />;
  return <Outlet />;
}
