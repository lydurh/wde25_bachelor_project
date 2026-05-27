import { Link } from 'react-router';
import { AuthNav } from '@/components/auth/auth-nav';

export const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-foreground">
          Book an Appointment
        </Link>
        <AuthNav />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-semibold text-foreground">
          Book an Appointment!
        </h1>
        <Link
          to="/book/time"
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Get started
        </Link>
      </main>
    </div>
  );
};
