import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

type NavItem = {
  label: string;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Hjem', to: '/admin' },
  { label: 'Services', to: '/admin/services' },
  { label: 'Arbejdstider', to: '/admin/availability' },
  { label: 'Aftaler', to: '/admin/appointments' },
  { label: 'Brugere', to: '/admin/users' },
  { label: 'Indstillinger', to: '/admin/settings' },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar p-4 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Admin
          </h2>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 hover:bg-sidebar-accent md:hidden"
            aria-label="Close menu"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'inline-flex w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-sidebar-border bg-sidebar p-4 md:hidden">
          <h1 className="font-semibold text-sidebar-foreground">Admin</h1>

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-sidebar-accent"
            aria-label="Open menu"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
