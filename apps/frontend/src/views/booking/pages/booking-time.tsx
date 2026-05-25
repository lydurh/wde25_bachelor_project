import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import { format, parse } from 'date-fns';
import type { Availability } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { AvailabilityLoaderData } from '@/lib/loaders/availability';
import { useBooking } from '@/views/booking/booking-context';

const DATE_ID_FORMAT = 'yyyy-MM-dd';

type FeasibleSlot = {
  iso: string;
  label: string;
  reachable: boolean;
  driveMinutes: number;
};

function isBookable(row: Availability): boolean {
  return !row.availability_deleted_at && row.availability_type === 'available';
}

function parseDateId(dateId: string): Date {
  return parse(dateId, DATE_ID_FORMAT, new Date());
}

export const TimeSelectPage = () => {
  const { availabilities } = useLoaderData<AvailabilityLoaderData>();
  const { draft, setDraft } = useBooking();

  const selectedDateId = draft.selectedDateId ?? '';
  const serviceDuration = draft.cumulatedServiceDuration ?? 30;
  const customerAddress = draft.address ?? '';

  const [slotsForDay, setSlotsForDay] = useState<FeasibleSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(
    async (date: string) => {
      if (!customerAddress) return;
      setLoading(true);
      try {
        const { data } = await api.post<{ data: FeasibleSlot[] }>(
          '/availability/slots',
          {
            date,
            serviceDuration,
            customerAddress,
          },
        );
        setSlotsForDay(data);
      } catch {
        setSlotsForDay([]);
      } finally {
        setLoading(false);
      }
    },
    [customerAddress, serviceDuration],
  );

  useEffect(() => {
    if (selectedDateId) {
      void fetchSlots(selectedDateId);
    } else {
      setSlotsForDay([]);
    }
  }, [selectedDateId, fetchSlots]);

  const { availableDates, calendarBounds, selectedDate } = useMemo(() => {
    const bookable = availabilities.filter(isBookable);
    const dateIds = bookable.map((row) => row.availability_date.slice(0, 10));
    const availableDates = new Set(dateIds);
    const sorted = [...availableDates].sort();

    const calendarBounds =
      sorted.length === 0
        ? { startMonth: new Date(), endMonth: new Date() }
        : {
            startMonth: parseDateId(sorted[0]!),
            endMonth: parseDateId(sorted[sorted.length - 1]!),
          };

    const selectedDate = selectedDateId
      ? parseDateId(selectedDateId)
      : undefined;

    return {
      availableDates,
      calendarBounds,
      selectedDate,
    };
  }, [availabilities, selectedDateId]);

  return (
    <Card className="max-h-[500px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Hvornår
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setDraft({ selectedDateId: format(date, DATE_ID_FORMAT) });
              }
            }}
            defaultMonth={selectedDate ?? calendarBounds.startMonth}
            startMonth={calendarBounds.startMonth}
            endMonth={calendarBounds.endMonth}
            disabled={(date) =>
              !availableDates.has(format(date, DATE_ID_FORMAT))
            }
            className="rounded-md border h-full w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {!selectedDateId ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Vælg en dato for at se ledige tider.
            </p>
          ) : loading ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Henter ledige tider...
            </p>
          ) : slotsForDay.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Ingen ledige tider på den valgte dato.
            </p>
          ) : (
            slotsForDay.map((slot) => {
              const isSelected = draft.slotISO === slot.iso;

              return (
                <Button
                  key={slot.iso}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full"
                  disabled={!slot.reachable}
                  onClick={() => setDraft({ slotISO: slot.iso })}
                >
                  {slot.label}
                  {!slot.reachable && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (for langt)
                    </span>
                  )}
                </Button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
