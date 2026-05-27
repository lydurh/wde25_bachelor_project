import { Navigate } from 'react-router';
import { auth } from '@/lib/auth';
import { ProtectedRoute } from './protected-route';

type AdminRouteProps = {
  children: React.ReactNode;
};

export const AdminRoute = ({ children }: AdminRouteProps) => {
  return (
    <ProtectedRoute>
      {auth.isAdmin() ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
};
