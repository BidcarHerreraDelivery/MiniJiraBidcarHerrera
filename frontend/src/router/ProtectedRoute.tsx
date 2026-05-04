import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '../features/auth/store/authStore';
import { authApi } from '../features/auth/api/authApi';

export function ProtectedRoute() {
  const { isAuthenticated, setUser, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((res) => { setUser(res.data); setChecking(false); })
      .catch(() => {
        clearSession();
        setChecking(false);
        navigate('/login');
      });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Cargando…
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <Outlet />;
}
