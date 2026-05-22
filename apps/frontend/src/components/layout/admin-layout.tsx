import { Outlet } from 'react-router';
import { AuthNav } from '@/components/auth/auth-nav';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-sidebar p-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Admin</h2>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex justify-end border-b border-border bg-card px-6 py-4">
          <AuthNav />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
