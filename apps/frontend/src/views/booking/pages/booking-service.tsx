import { useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router';
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
// import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import type { BookingOutletContext } from '@/views/booking/types';
import type { ServicesLoaderData } from '@/lib/loaders/service';

export const ServicesPage = () => {
  const loaderData = useLoaderData<ServicesLoaderData>();
  const navigate = useNavigate();
  const { setDraft } = useOutletContext<BookingOutletContext>();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      loaderData.services.map((service) => [service.service_pk, 0]),
    ),
  );

  const adjustQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleContinue = () => {
    const firstSelected = loaderData.services.find(
      (service) => (quantities[service.service_pk] ?? 0) > 0,
    );
    if (firstSelected) {
      setDraft({ serviceId: firstSelected.service_pk });
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
        {loaderData.services.map((service) => {
          const quantity = quantities[service.service_pk] ?? 0;

          return (
            <div
              key={service.service_pk}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium">
                {service.service_title} – {service.service_price}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Øg antal ${service.service_title}`}
                  onClick={() => adjustQuantity(service.service_pk, 1)}
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
                  aria-label={`Mindsk antal ${service.service_title}`}
                  onClick={() => adjustQuantity(service.service_pk, -1)}
                  disabled={quantity === 0}
                >
                  <HugeiconsIcon icon={Remove01Icon} strokeWidth={2} />
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-4 py-4">
          {/* <span className="text-sm font-medium">
            <LocationFeeLabel /> – {LOCATION_FEE_KR} kr
          </span> */}
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
