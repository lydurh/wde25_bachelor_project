import { format, parse } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import {
  BOOKING_LOCATION_FEE_KR,
  getBookingTotalPriceKr,
  getLinePriceKr,
} from '@repo/shared';
import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import { BookingSuccessDialog } from '@/views/booking/components/booking-success-dialog';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { getBookingTabStep } from '@/views/booking/booking-steps';

const DATE_ID_FORMAT = 'yyyy-MM-dd';
const SLOT_ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

function formatAppointmentDateTime(
  dateId: string | undefined,
  slotISO: string | undefined,
): string | null {
  if (!dateId || !slotISO) return null;

  try {
    const date = parse(dateId, DATE_ID_FORMAT, new Date());
    const slot = parse(slotISO, SLOT_ISO_FORMAT, new Date());
    return `${format(date, 'd. MMM yyyy')} kl. ${format(slot, 'HH:mm')}`;
  } catch {
    return `${dateId} kl. ${slotISO.slice(11, 16)}`;
  }
}

export const ConfirmationPage = () => {
  const {
    draft,
    handleContinue,
    continueDisabled,
    continueLabel,
    isSubmitting,
    bookingCustomer,
    showSuccessDialog,
    setShowSuccessDialog,
  } = useBooking();

  useBookingStepFooter({
    disabled: false,
    label: 'Book tid',
  });

  const selectedServices = draft.selectedServices ?? [];
  const locationFeeApplies = draft.locationFeeApplies ?? false;
  const totalPriceKr = getBookingTotalPriceKr(
    selectedServices,
    locationFeeApplies,
  );

  const appointmentLabel = formatAppointmentDateTime(
    draft.selectedDateId,
    draft.slotISO,
  );

  const customerName = [draft.firstName, draft.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  const locationLine = [draft.postalCode?.trim(), draft.city?.trim()]
    .filter(Boolean)
    .join(' ');

  return (
    <Card className="h-fit max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Bekræft booking</CardTitle>
        <CardDescription>Gennemgå dit valg, før du booker.</CardDescription>
      </CardHeader>
      <CardContent className="">
        <ItemGroup>
          <Item variant="default" size="sm" className="px-0 py-2">
            <ItemMedia variant="icon">
              <HugeiconsIcon
                icon={getBookingTabStep('service')!.icon}
                strokeWidth={2}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Ydelser</ItemTitle>
              {selectedServices.length === 0 ? (
                <ItemDescription>—</ItemDescription>
              ) : (
                <div className="space-y-1 text-foreground">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span>
                        {s.quantity > 1 ? `${s.quantity} × ` : ''}
                        {s.title}
                      </span>
                      <span>-</span>
                      <span>{getLinePriceKr(s).toFixed(2)} kr</span>
                    </div>
                  ))}
                </div>
              )}
            </ItemContent>
          </Item>

          <Item variant="default" size="sm" className="px-0 py-2">
            <ItemMedia variant="icon">
              <HugeiconsIcon
                icon={getBookingTabStep('time')!.icon}
                strokeWidth={2}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Dato og tid</ItemTitle>
              <ItemDescription className="text-foreground">
                {appointmentLabel ?? '—'}
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item variant="default" size="sm" className="px-0 py-2">
            <ItemMedia variant="icon">
              <HugeiconsIcon
                icon={getBookingTabStep('user')!.icon}
                strokeWidth={2}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Kontakt</ItemTitle>
              <ItemDescription className="space-y-0.5 text-foreground">
                {bookingCustomer ? (
                  <span className="block">
                    {bookingCustomer.user_first_name}{' '}
                    {bookingCustomer.user_last_name}
                  </span>
                ) : null}
                {customerName ? (
                  <span className="block">{customerName}</span>
                ) : null}
                {bookingCustomer?.user_email ? (
                  <span className="block">{bookingCustomer.user_email}</span>
                ) : null}
                {draft.email?.trim() ? (
                  <span className="block">{draft.email.trim()}</span>
                ) : null}
                {draft.phone?.trim() ? (
                  <span className="block">{draft.phone.trim()}</span>
                ) : null}
                {!bookingCustomer &&
                !customerName &&
                !draft.email?.trim() &&
                !draft.phone?.trim()
                  ? '—'
                  : null}
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item variant="default" size="sm" className="px-0 py-2">
            <ItemMedia variant="icon">
              <HugeiconsIcon
                icon={getBookingTabStep('location')!.icon}
                strokeWidth={2}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Lokation</ItemTitle>
              <ItemDescription className="space-y-0.5 text-foreground">
                {draft.address?.trim() ? (
                  <span className="block">{draft.address.trim()}</span>
                ) : null}
                {locationLine ? (
                  <span className="block">{locationLine}</span>
                ) : null}
                {!draft.address?.trim() && !locationLine ? '—' : null}
              </ItemDescription>
            </ItemContent>
          </Item>

          {draft.comments?.trim() ? (
            <Item variant="default" size="sm" className="px-0">
              <ItemContent>
                <ItemTitle>Kommentar</ItemTitle>
                <ItemDescription className="whitespace-pre-wrap text-foreground">
                  {draft.comments.trim()}
                </ItemDescription>
              </ItemContent>
            </Item>
          ) : null}
        </ItemGroup>
        <Separator className="my-4" />
        {locationFeeApplies ? (
          <Item variant="default" size="sm" className="p-0">
            <ItemContent className="flex flex-row justify-between">
              <ItemTitle>
                <LocationFeeLabel />
              </ItemTitle>
              <ItemDescription className="text-foreground">
                {BOOKING_LOCATION_FEE_KR.toFixed(2)} kr
              </ItemDescription>
            </ItemContent>
          </Item>
        ) : null}
        <Item variant="default" size="sm" className="p-0">
          <ItemContent className="flex flex-row justify-between">
            <ItemTitle>Total</ItemTitle>
            <ItemDescription className="text-foreground">
              {totalPriceKr.toFixed(2)} kr
            </ItemDescription>
          </ItemContent>
        </Item>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          onClick={handleContinue}
          disabled={continueDisabled || isSubmitting}
        >
          {isSubmitting ? 'Booker...' : continueLabel}
        </Button>
      </CardFooter>
      <BookingSuccessDialog
        isOpen={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
    </Card>
  );
};
