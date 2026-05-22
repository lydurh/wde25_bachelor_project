import { Outlet } from 'react-router';
import { AuthNav } from '@/components/auth/auth-nav';

export const UserLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-semibold">My Account</h1>
        <AuthNav />
      </header>
      <main className="mx-auto max-w-4xl p-6">
        <Outlet />
      </main>
    </div>
  );
};
