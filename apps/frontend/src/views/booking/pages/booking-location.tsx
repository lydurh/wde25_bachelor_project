import { useCallback, useEffect, useRef, useState } from 'react';
import type { Location } from '@repo/shared';
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
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { hasLocationInput } from '@/views/booking/booking-guards';
import { usePlaceAutocomplete } from '@/views/booking/use-place-autocomplete';

function formatLocationAddress(location: Location): string {
  const cityLine = [location.location_postal_code, location.location_city]
    .filter(Boolean)
    .join(' ');

  return cityLine
    ? `${location.location_address}, ${cityLine}`
    : location.location_address;
}

function locationToDraftPatch(location: Location) {
  return {
    address: formatLocationAddress(location),
    city: location.location_city,
    ...(location.location_postal_code
      ? { postalCode: location.location_postal_code }
      : {}),
  };
}

export const LocationPage = () => {
  const { draft, setDraft } = useBooking();
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const [usualLocation, setUsualLocation] = useState<Location | null>(null);
  const [useUsualAddress, setUseUsualAddress] = useState(
    () => !!draft.selectedCustomer?.user_location_fk,
  );

  useBookingStepFooter({
    disabled: !hasLocationInput(draft),
    label: 'Fortsæt',
  });

  useEffect(() => {
    const locationFk = draft.selectedCustomer?.user_location_fk;
    if (!locationFk) {
      setUsualLocation(null);
      setUseUsualAddress(false);
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
  }, [draft.selectedCustomer?.user_location_fk]);

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

      setDraft({ address: '', city: '', postalCode: '' });
    },
    [setDraft, usualLocation],
  );

  const onAddressSelected = useCallback(
    (address: string) => setDraft({ address }),
    [setDraft],
  );

  usePlaceAutocomplete(autocompleteContainerRef, onAddressSelected, {
    enabled: !useUsualAddress,
  });

  const usualAddressLabel = usualLocation
    ? formatLocationAddress(usualLocation)
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
              {/* <FieldLabel htmlFor="booking-address-search">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                Søg efter adresse
              </FieldLabel> */}
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
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};
