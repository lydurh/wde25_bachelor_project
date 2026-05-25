import { useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { hasLocationInput } from '@/views/booking/booking-guards';

const GOOGLE_API_KEY = import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string;

let mapsCore: Promise<void> | null = null;

function loadMapsCore(): Promise<void> {
  if (mapsCore) return mapsCore;
  mapsCore = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&v=weekly&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return mapsCore;
}

export const LocationPage = () => {
  const { draft, setDraft } = useBooking();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementCreated = useRef(false);

  useBookingStepFooter({
    disabled: !hasLocationInput(draft),
    label: 'Fortsæt',
  });

  const onPlaceSelect = useCallback(
    (e: Event) => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
      const detail = (e as any).placePrediction;
      if (!detail) return;
      const place = detail.toPlace();
      void (
        place.fetchFields({ fields: ['formattedAddress'] }) as Promise<void>
      ).then(() => {
        const address = place.formattedAddress as string | undefined;
        if (address) {
          setDraft({ address });
        }
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
    },
    [setDraft],
  );

  useEffect(() => {
    if (elementCreated.current) return;

    void loadMapsCore().then(async () => {
      if (!containerRef.current || elementCreated.current) return;
      elementCreated.current = true;

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
      const { PlaceAutocompleteElement: PAC } = await (
        google.maps as any
      ).importLibrary('places');
      const pac: HTMLElement = new PAC({
        includedRegionCodes: ['dk'],
        includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

      pac.setAttribute('placeholder', 'Søg efter adresse...');
      pac.style.width = '100%';

      pac.addEventListener('gmp-select', onPlaceSelect);
      containerRef.current.appendChild(pac);
    });
  }, [onPlaceSelect]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Lokation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} />
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
