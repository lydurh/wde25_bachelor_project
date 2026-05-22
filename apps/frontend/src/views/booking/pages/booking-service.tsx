import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Remove01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import type { BookingOutletContext } from '@/views/booking/types';

const PLACEHOLDER_SERVICES = [
  { id: 'dameklip', label: 'Dameklip', priceLabel: '450 kr' },
  { id: 'herreklip', label: 'Herreklip', priceLabel: '400 kr' },
  { id: 'boerneklip', label: 'Børneklip', priceLabel: '350 kr' },
  { id: 'dameklip-foen', label: 'Dameklip & føn', priceLabel: '500 kr' },
  { id: 'foentoering', label: 'Føntøring alene', priceLabel: '400 kr' },
  { id: 'farve', label: 'Farve', priceLabel: 'Fra 500 kr' },
  {
    id: 'striber-hele-haaret',
    label: 'Striber i hele håret',
    priceLabel: '1000 kr',
  },
  {
    id: 'striber-sider-top',
    label: 'Striber i sider & top',
    priceLabel: '750 kr',
  },
  {
    id: 'striber-skilning-top',
    label: 'Striber i skilning & top',
    priceLabel: '500 kr',
  },
  {
    id: 'farve-mellem-striber',
    label: 'Farve i mellem striber',
    priceLabel: 'Fra 200 kr',
  },
] as const;

const LOCATION_FEE_KR = 50;

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { setDraft } = useOutletContext<BookingOutletContext>();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(PLACEHOLDER_SERVICES.map((service) => [service.id, 0])),
  );

  const adjustQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleContinue = () => {
    const firstSelected = PLACEHOLDER_SERVICES.find(
      (service) => (quantities[service.id] ?? 0) > 0,
    );
    if (firstSelected) {
      setDraft({ serviceId: firstSelected.id });
    }
    void navigate('time');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Ydelser
        </CardTitle>
        <CardDescription>vælg antal services herunder</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border">
        {PLACEHOLDER_SERVICES.map((service) => {
          const quantity = quantities[service.id] ?? 0;

          return (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium">
                {service.label} – {service.priceLabel}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Øg antal ${service.label}`}
                  onClick={() => adjustQuantity(service.id, 1)}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                </Button>
                <span
                  className="min-w-8 text-center text-sm tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Mindsk antal ${service.label}`}
                  onClick={() => adjustQuantity(service.id, -1)}
                  disabled={quantity === 0}
                >
                  <HugeiconsIcon icon={Remove01Icon} strokeWidth={2} />
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-4 py-4">
          <span className="text-sm font-medium">
            <LocationFeeLabel /> – {LOCATION_FEE_KR} kr
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleContinue}>
          Fortsæt
        </Button>
      </CardFooter>
    </Card>
  );
};
