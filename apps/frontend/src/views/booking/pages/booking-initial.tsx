import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { Link, Navigate } from 'react-router';

export const InitialbookingPage = () => {
  const isLoggedIn = auth.isAuthenticated();
  if (isLoggedIn) {
    return <Navigate to="/book/service" replace />;
  }

  return (
    <div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Hvordan vil du fortsætte?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-8">
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link to="/login">Jeg har allerede en konto</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link to="/signup">Jeg vil oprette en ny konto</Link>
          </Button>
        </CardContent>
        <CardFooter className="border-t border-border py-6">
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link to="/book/service">Jeg vil fortsætte som gæst</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
