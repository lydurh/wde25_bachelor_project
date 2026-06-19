import { useCallback, useEffect, useRef, useState } from 'react';
import { formatLocationAddress, type Location } from '@repo/shared';
import { Home09Icon, LocationCheck01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toLocationBiasCenter } from '@repo/shared';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { hasLocationInput } from '@/views/booking/booking-guards';
import { useLocationDistanceCheck } from '@/views/booking/use-location-distance-check';
import { usePlaceAutocomplete } from '@/views/booking/use-place-autocomplete';

function locationToDraftPatch(location: Location) {
  return {
    locationFk: location.location_pk,
    address: formatLocationAddress({
      location_address: location.location_address,
      location_postal_code: location.location_postal_code,
      location_city: location.location_city,
    }),
    city: location.location_city,
    ...(location.location_postal_code
      ? { postalCode: location.location_postal_code }
      : {}),
  };
}

export const LocationPage = () => {
  const {
    draft,
    setDraft,
    adminOrigin,
    businessSettings,
    user,
    location,
    bookingCustomer,
  } = useBooking();
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const sessionUsualLocation =
    user?.user_pk === bookingCustomer?.user_pk ? location : null;
  const [usualLocation, setUsualLocation] = useState<Location | null>(
    () => sessionUsualLocation,
  );
  const [useUsualAddress, setUseUsualAddress] = useState(
    () => !!bookingCustomer?.user_location_fk,
  );

  useLocationDistanceCheck({
    address: draft.address,
    setDraft,
  });

  useBookingStepFooter({
    disabled: !hasLocationInput(draft) || draft.distanceCheckStatus !== 'ready',
    label: 'Fortsæt',
  });

  useEffect(() => {
    const locationFk = bookingCustomer?.user_location_fk;
    if (!locationFk) {
      setUsualLocation(null);
      setUseUsualAddress(false);
      return;
    }

    if (
      sessionUsualLocation &&
      sessionUsualLocation.location_pk === locationFk
    ) {
      setUsualLocation(sessionUsualLocation);
      return;
    }

    let cancelled = false;

    void api
      .get<{ data: Location }>(`/locations/${locationFk}`)
      .then(({ data }) => {
        if (cancelled) return;
        setUsualLocation(data);
      })
      .catch((error: unknown) => {
        console.error('Failed to load customer address', error);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingCustomer?.user_location_fk, sessionUsualLocation]);

  useEffect(() => {
    if (!usualLocation || !useUsualAddress) return;
    setDraft(locationToDraftPatch(usualLocation));
  }, [usualLocation, useUsualAddress, setDraft]);

  const onUseUsualAddressChange = useCallback(
    (checked: boolean) => {
      setUseUsualAddress(checked);

      if (checked && usualLocation) {
        setDraft(locationToDraftPatch(usualLocation));
        return;
      }

      setDraft({ address: '', city: '', postalCode: '', locationFk: null });
    },
    [setDraft, usualLocation],
  );

  const onAddressSelected = useCallback(
    (address: string) =>
      setDraft({ address, city: '', postalCode: '', locationFk: null }),
    [setDraft],
  );

  const locationBiasCenter = toLocationBiasCenter(adminOrigin);

  usePlaceAutocomplete(autocompleteContainerRef, onAddressSelected, {
    enabled: !useUsualAddress,
    locationBiasCenter,
  });

  const usualAddressLabel = usualLocation
    ? formatLocationAddress({
        location_address: usualLocation.location_address,
        location_postal_code: usualLocation.location_postal_code,
        location_city: usualLocation.location_city,
      })
    : null;
  const showCustomSearch = !useUsualAddress || !usualAddressLabel;
  const showSelectedAddress = !!draft.address?.trim() && !useUsualAddress;

  return (
    <div className="w-full">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Lokation
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <FieldGroup className="gap-4">
            {usualAddressLabel ? (
              <Item variant="outline" className="items-center">
                <ItemMedia variant="icon" className="self-center">
                  <HugeiconsIcon
                    icon={Home09Icon}
                    strokeWidth={2}
                    className="self-center"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Sædvanlig adresse</ItemTitle>
                  <ItemDescription>{usualAddressLabel}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="use-usual-address"
                      checked={useUsualAddress}
                      onCheckedChange={onUseUsualAddressChange}
                    />
                    <Label htmlFor="use-usual-address" className="sr-only">
                      Brug sædvanlig adresse
                    </Label>
                  </div>
                </ItemActions>
              </Item>
            ) : null}

            <Field className={cn(!showCustomSearch && 'hidden')}>
              <div
                id="booking-address-search"
                ref={autocompleteContainerRef}
                className="relative z-10"
              />
            </Field>

            {showSelectedAddress ? (
              <Item variant="default">
                <ItemMedia variant="icon">
                  <HugeiconsIcon
                    icon={LocationCheck01Icon}
                    strokeWidth={2}
                    className="text-success"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Valgt adresse</ItemTitle>
                  <ItemDescription>{draft.address}</ItemDescription>
                </ItemContent>
              </Item>
            ) : null}

            {draft.distanceCheckStatus === 'loading' ? (
              <p className="text-sm text-muted-foreground">
                Beregner afstand fra udgangspunkt...
              </p>
            ) : null}
            {draft.distanceCheckStatus === 'error' ? (
              <p className="text-sm text-destructive">
                Kunne ikke beregne afstand. Prøv en anden adresse.
              </p>
            ) : null}
            {draft.distanceCheckStatus === 'ready' &&
            draft.locationFeeApplies ? (
              <p className="text-sm text-muted-foreground">
                Adressen ligger mere end{' '}
                {businessSettings.location_fee_threshold_km} km fra
                udgangspunktet. Udkørselsgebyr tillægges.
              </p>
            ) : null}
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};
