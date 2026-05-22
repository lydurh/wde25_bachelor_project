import { Link, useNavigate } from 'react-router';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export const AuthNav = () => {
  const navigate = useNavigate();
  const isLoggedIn = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();
  const email = auth.getUserEmail();

  const handleLogout = () => {
    auth.clearToken();
    void api.post('/auth/logout', {}).catch(() => undefined);
    void navigate('/login', { replace: true });
  };

  if (!isLoggedIn) {
    return (
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
        <Link
          to="/signup"
          className="rounded-lg bg-black px-3 py-1.5 text-primary-foreground hover:opacity-90"
        >
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      {email && (
        <span className="text-muted-foreground hidden sm:inline">{email}</span>
      )}
      <Link
        to={isAdmin ? '/admin' : '/dashboard'}
        className="text-primary hover:underline"
      >
        {isAdmin ? 'Admin' : 'My account'}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
      >
        Logout
      </button>
    </nav>
  );
};
