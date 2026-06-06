import { AuthNav } from '@/components/auth/auth-nav';
import { HugeiconsIcon } from '@hugeicons/react';
import { ScissorIcon } from '@hugeicons/core-free-icons';
import { Link } from 'react-router';

export const Navbar = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <HugeiconsIcon icon={ScissorIcon} className="h-4 w-4 shrink-0" />

          <span className="font-semibold">HairAtHome</span>
        </Link>
        <AuthNav />
      </div>
    </header>
  );
};
