import { NavLink, Outlet } from 'react-router';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Home', to: '/admin' },
  { label: 'Services', to: '/admin/services' },
  { label: 'Availability', to: '/admin/availability' },
  { label: 'Appointments', to: '/admin/appointments' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Settings', to: '/admin/settings' },
];

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar p-4">
        <h2 className="mb-6 text-lg font-semibold text-sidebar-foreground">
          Admin
        </h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
