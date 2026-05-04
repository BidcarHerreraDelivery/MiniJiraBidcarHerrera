import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import { TicketDetailPage } from '../pages/TicketDetailPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/board" replace /> },
          { path: '/board', element: <BoardPage /> },
          { path: '/tickets/:id', element: <TicketDetailPage /> },
          { path: '/dashboard', element: <DashboardPage /> },
          {
            element: <AdminRoute />,
            children: [{ path: '/admin/users', element: <AdminUsersPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
