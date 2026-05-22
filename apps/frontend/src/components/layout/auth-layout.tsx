import { Outlet } from 'react-router';
import { AuthNav } from '@/components/auth/auth-nav';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex justify-end border-b border-border bg-card px-6 py-4">
        <AuthNav />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
