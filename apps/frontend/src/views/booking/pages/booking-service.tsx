import { useLoaderData } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Remove01Icon } from '@hugeicons/core-free-icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import {
  buildSelectedServiceLines,
  getCumulatedServiceDurationFromQuantities,
} from '@repo/shared';
import type { ServicesLoaderData } from '@/lib/loaders/service';
import { useBooking } from '@/views/booking/booking-context';

function buildDefaultQuantities(
  services: ServicesLoaderData['services'],
  saved?: Record<string, number>,
): Record<string, number> {
  return Object.fromEntries(
    services.map((service) => [
      service.service_pk,
      saved?.[service.service_pk] ?? 0,
    ]),
  );
}

export const ServicesPage = () => {
  const loaderData = useLoaderData<ServicesLoaderData>();
  const { draft, setDraft } = useBooking();
  const quantities = buildDefaultQuantities(
    loaderData.services,
    draft.serviceQuantities,
  );

  const adjustQuantity = (id: string, delta: number) => {
    const next = {
      ...quantities,
      [id]: Math.max(0, (quantities[id] ?? 0) + delta),
    };
    setDraft({
      serviceQuantities: next,
      selectedServices: buildSelectedServiceLines(loaderData.services, next),
      cumulatedServiceDuration: getCumulatedServiceDurationFromQuantities(
        loaderData.services,
        next,
      ),
    });
  };

  const handleComment = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const textarea = e.currentTarget.elements.namedItem(
      'appointment_note',
    ) as HTMLTextAreaElement | null;

    if (!textarea) return;

    setDraft({
      comments: textarea.value,
    });
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Services
          </CardTitle>
          <CardDescription>Vælg antal services herunder</CardDescription>
        </div>
        <Dialog>
          <form onSubmit={handleComment}>
            <DialogTrigger asChild>
              <Button variant="outline">Tilføj Kommentar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <FieldGroup>
                <Field>
                  <Label htmlFor="name-1">Kommentar</Label>
                  <Textarea
                    name="appointment_note"
                    id="appointment_note"
                    value={draft.comments ?? ''}
                    onChange={(e) =>
                      setDraft({ comments: e.currentTarget.value })
                    }
                    placeholder="Kommentar (ønsket hårfarve, allergier osv.)"
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Anuller</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit">Gem</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-0 divide-y divide-border">
        {loaderData.services.map((service) => {
          const quantity = quantities[service.service_pk] ?? 0;

          return (
            <div
              key={service.service_pk}
              className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold">
                  {service.service_title} – {service.service_price} kr.
                </span>
                <p className="text-sm text-muted-foreground">
                  {service.service_description}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
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
                  aria-label={`Øg antal ${service.service_title}`}
                  onClick={() => adjustQuantity(service.service_pk, 1)}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
