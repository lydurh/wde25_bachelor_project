import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { hasLocationInput } from '@/views/booking/booking-guards';

export const LocationPage = () => {
  const { draft, setDraft } = useBooking();

  useBookingStepFooter({
    disabled: !hasLocationInput(draft),
    label: 'Fortsæt',
  });

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Lokation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => e.preventDefault()}
            aria-label="Adresseoplysninger"
          >
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="booking-address">Adresse</FieldLabel>
                <Input
                  id="booking-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Vejnavn og husnummer"
                  value={draft.address ?? ''}
                  onChange={(e) => setDraft({ address: e.target.value })}
                />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
