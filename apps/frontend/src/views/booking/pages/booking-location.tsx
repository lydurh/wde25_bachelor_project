import { useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { hasLocationInput } from '@/views/booking/booking-guards';
import { usePlaceAutocomplete } from '@/views/booking/use-place-autocomplete';

export const LocationPage = () => {
  const { draft, setDraft } = useBooking();
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  useBookingStepFooter({
    disabled: !hasLocationInput(draft),
    label: 'Fortsæt',
  });

  const onAddressSelected = useCallback(
    (address: string) => setDraft({ address }),
    [setDraft],
  );

  usePlaceAutocomplete(autocompleteContainerRef, onAddressSelected);

  return (
    <div className="w-full">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Lokation
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div ref={autocompleteContainerRef} className="relative z-10" />
          {draft.address ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Valgt: {draft.address}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
