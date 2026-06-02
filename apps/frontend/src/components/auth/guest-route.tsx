import { Navigate, useLocation } from 'react-router';
import { auth } from '@/lib/auth';

type GuestRouteProps = {
  children: React.ReactNode;
};

const PASSWORD_RESET_PATHS = new Set(['/forgot-password', '/reset-password']);

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { pathname } = useLocation();

  if (!auth.isAuthenticated()) {
    return children;
  }

  if (PASSWORD_RESET_PATHS.has(pathname)) {
    return children;
  }

  if (auth.isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/profile" replace />;
};
