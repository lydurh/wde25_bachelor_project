import { format, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  BOOKING_LOCATION_FEE_KR,
  getBookingTotalPriceKr,
  getLinePriceKr,
} from '@repo/shared';
import { LocationFeeLabel } from '@/views/booking/components/location-fee-label';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';

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

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Bekræft booking</CardTitle>
        <CardDescription>Gennemgå dit valg, før du booker.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Ydelser</dt>
            <dd className="space-y-1 font-medium">
              {selectedServices.length === 0 ? (
                <span>—</span>
              ) : (
                selectedServices.map((line) => (
                  <div key={line.id}>
                    {line.title}
                    {line.quantity > 1 ? ` × ${line.quantity}` : ''} –{' '}
                    {getLinePriceKr(line)} kr
                  </div>
                ))
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Dato og tid</dt>
            <dd className="font-medium">{appointmentLabel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Kontakt</dt>
            <dd className="space-y-0.5 font-medium">
              <p>{bookingCustomer?.user_first_name}</p>
              <p>{bookingCustomer?.user_last_name}</p>
              <p>{bookingCustomer?.user_email}</p>

              {customerName ? <div>{customerName}</div> : null}
              {draft.email?.trim() ? <div>{draft.email.trim()}</div> : null}
              {draft.address?.trim() ? <div>{draft.address.trim()}</div> : null}
              {!customerName &&
              !draft.email?.trim() &&
              !draft.address?.trim() ? (
                <span>—</span>
              ) : null}
            </dd>
          </div>
          {draft.comments?.trim() ? (
            <div>
              <dt className="text-muted-foreground">Kommentar</dt>
              <dd className="font-medium whitespace-pre-wrap">
                {draft.comments.trim()}
              </dd>
            </div>
          ) : null}
          {locationFeeApplies ? (
            <div>
              <dt className="text-muted-foreground">
                <LocationFeeLabel />
              </dt>
              <dd className="font-medium">{BOOKING_LOCATION_FEE_KR} kr</dd>
            </div>
          ) : null}
        </dl>
        <Separator />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{totalPriceKr} kr</span>
        </div>
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
    </Card>
  );
};
