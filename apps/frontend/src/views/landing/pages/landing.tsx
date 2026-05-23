import { Link } from 'react-router';
import { AuthNav } from '@/components/auth/auth-nav';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

const isLoggedIn = auth.isAuthenticated();
// const isAdmin = auth.isAdmin();

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
          Velkommen til HairCuts!
        </h1>
        {isLoggedIn ? (
          <Button size="lg" asChild>
            <Link to="/book/service">Book en tid</Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link to="/book">Book en tid</Link>
          </Button>
        )}
      </main>
    </div>
  );
};
