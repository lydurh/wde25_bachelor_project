import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { isInformationStepComplete } from '@/views/booking/booking-guards';
import type { BookingDraft } from '@/views/booking/types';

export const InformationPage = () => {
  const { draft, setDraft, location, user } = useBooking();

  // TODO: Remove this
  console.log(location);
  console.log(user);

  useBookingStepFooter({
    disabled: !isInformationStepComplete(draft),
    label: 'Fortsæt',
  });

  const update =
    (
      field: keyof Pick<
        BookingDraft,
        'firstName' | 'lastName' | 'email' | 'address'
      >,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft({ [field]: e.target.value });
    };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => e.preventDefault()}
            aria-label="Bookingoplysninger"
          >
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="booking-first-name">Fornavn</FieldLabel>
                  <Input
                    id="booking-first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Navn"
                    value={draft.firstName ?? ''}
                    onChange={update('firstName')}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="booking-last-name">Efternavn</FieldLabel>
                  <Input
                    id="booking-last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Navn"
                    value={draft.lastName ?? ''}
                    onChange={update('lastName')}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="booking-address">Adresse</FieldLabel>
                <Input
                  id="booking-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Adresse / Lokation"
                  value={draft.address ?? ''}
                  onChange={update('address')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="booking-email">E-mail</FieldLabel>
                <Input
                  id="booking-email"
                  type="email"
                  autoComplete="email"
                  placeholder="E-mail"
                  value={draft.email ?? ''}
                  onChange={update('email')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="booking-comments">Kommentar</FieldLabel>
                <Textarea
                  id="booking-comments"
                  placeholder="Kommentar (ønsket hårfarve, allergier osv.)"
                  value={draft.comments ?? ''}
                  onChange={(e) => setDraft({ comments: e.target.value })}
                  rows={5}
                />
              </Field>
              <div className="flex items-start justify-start gap-3 pt-2">
                <Checkbox
                  id="booking-policy"
                  checked={draft.policyAccepted ?? false}
                  onCheckedChange={(checked) =>
                    setDraft({ policyAccepted: checked === true })
                  }
                />
                <FieldLabel
                  htmlFor="booking-policy"
                  className="max-w-sm text-right font-normal leading-snug text-muted-foreground"
                >
                  Accepter vilkår og betingelser
                </FieldLabel>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
