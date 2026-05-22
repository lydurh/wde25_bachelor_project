import { Navigate } from 'react-router';
import { auth } from '@/lib/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
