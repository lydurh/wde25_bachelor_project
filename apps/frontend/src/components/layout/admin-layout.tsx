import { Outlet } from 'react-router';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-sidebar p-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Admin</h2>
        {/* Sidebar nav placeholder */}
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
