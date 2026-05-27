import { AuthNav } from '@/components/auth/auth-nav';

export const Navbar = () => {
  return (
    <header className="flex justify-end border-b border-border bg-card px-6 py-4">
      <AuthNav />
    </header>
  );
};
