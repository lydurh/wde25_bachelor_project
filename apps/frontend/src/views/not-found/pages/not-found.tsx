import { AuthNav } from '@/components/auth/auth-nav';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex justify-end border-b border-border bg-card px-6 py-4">
        <AuthNav />
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-3xl space-y-6 px-2 md:px-0">
          <h1 className="text-4xl font-semibold text-foreground">
            Siden blev ikke fundet
          </h1>
          <Button asChild>
            <Link to="/">Tilbage til forsiden</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};
