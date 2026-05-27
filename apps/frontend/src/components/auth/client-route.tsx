import { Navigate } from 'react-router';
import { auth } from '@/lib/auth';

type ClientRouteProps = {
  children: React.ReactNode;
};

export const ClientRoute = ({ children }: ClientRouteProps) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (auth.isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
