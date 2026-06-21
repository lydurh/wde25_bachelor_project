import { Link, useRouteError } from 'react-router';

import { AuthNav } from '@/components/auth/auth-nav';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api';

export const RouteErrorPage = () => {
  const error = useRouteError();
  const message = getErrorMessage(error);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex justify-end border-b border-border bg-card px-6 py-4">
        <AuthNav />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Noget gik galt
          </h1>
          <p
            role="alert"
            className="text-sm text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {message}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => window.location.reload()}>
              Prøv igen
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Tilbage til forsiden</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
