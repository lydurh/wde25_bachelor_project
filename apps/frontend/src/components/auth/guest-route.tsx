import { Navigate } from 'react-router';
import { auth } from '@/lib/auth';

type GuestRouteProps = {
  children: React.ReactNode;
};

export const GuestRoute = ({ children }: GuestRouteProps) => {
  if (!auth.isAuthenticated()) {
    return children;
  }

  if (auth.isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/profile" replace />;
};
