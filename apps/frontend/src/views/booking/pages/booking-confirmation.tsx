import { useNavigate } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const ConfirmationPage = () => {
  const navigate = useNavigate();

  return (
    <Card className="relative text-center">
      <CardHeader>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Luk"
            onClick={() => {
              void navigate('/');
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </CardAction>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Tak for din booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Din forespørgsel er sendt til frisøren og afventer godkendelse. Du har
          modtaget en kvittering på e-mail, og vi giver dig besked, så snart din
          tid er bekræftet.
        </p>
      </CardContent>
    </Card>
  );
};
