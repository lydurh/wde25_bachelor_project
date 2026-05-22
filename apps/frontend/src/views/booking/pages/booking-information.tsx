import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import type { BookingOutletContext } from '@/views/booking/types';

export const InformationPage = () => {
  const navigate = useNavigate();
  const { draft, setDraft } = useOutletContext<BookingOutletContext>();
  const [comments, setComments] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const update =
    (
      field: keyof Pick<
        BookingOutletContext['draft'],
        'firstName' | 'lastName' | 'email' | 'address'
      >,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft({ [field]: e.target.value });
    };

  const handleBook = () => {
    void navigate('confirm');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
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
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={5}
                />
              </Field>
              <div className="flex items-start justify-end gap-3 pt-2">
                <FieldLabel
                  htmlFor="booking-policy"
                  className="max-w-sm text-right font-normal leading-snug text-muted-foreground"
                >
                  Accepter vilkår og betingelser
                </FieldLabel>
                <Checkbox
                  id="booking-policy"
                  checked={acceptedPolicy}
                  onCheckedChange={(checked) =>
                    setAcceptedPolicy(checked === true)
                  }
                />
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Bekræft booking</CardTitle>
          <CardDescription>Gennemgå dit valg, før du booker.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Ydelser</dt>
              <dd className="font-medium">2x – herreklip – 400 kr</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dato og tid</dt>
              <dd className="font-medium">30. april 2026 kl. 12</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lokation</dt>
              <dd className="font-medium">Guldbergsgade 29N, 2200 København</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                <LocationFeeLabel />
              </dt>
              <dd className="font-medium">50 kr.</dd>
            </div>
          </dl>
          <Separator />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span>850 kr</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            className="w-full"
            onClick={handleBook}
            disabled={!acceptedPolicy}
          >
            Book tid
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
