import { Outlet } from 'react-router';

export const AdminLayout = () => {
  return (
    <div className="flex flex-1">
      <aside className="w-64 border-r border-border bg-sidebar p-4">
        {/* Admin sidebar placeholder for future nav items */}
      </aside>
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
