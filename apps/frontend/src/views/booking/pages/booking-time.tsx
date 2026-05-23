import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import { format, parse } from 'date-fns';
import type { Availability } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AvailabilityLoaderData } from '@/lib/loaders/availability';
import { useBooking } from '@/views/booking/booking-context';

const SLOT_INTERVAL = 30;
const DATE_ID_FORMAT = 'yyyy-MM-dd';

type TimeSlot = { iso: string; label: string };

function parseMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr ?? 0);
  const minutes = Number(minutesStr ?? 0);
  return hours * 60 + minutes;
}

function buildSlotsForDay(
  rows: Availability[],
  durationMinutes: number,
): TimeSlot[] {
  const slots = new Map<string, TimeSlot>();

  for (const row of rows) {
    const date = row.availability_date.slice(0, 10);
    let start = parseMinutes(row.availability_start_time);
    const end = parseMinutes(row.availability_end_time);
    if (start >= end) continue;

    for (; start + durationMinutes <= end; start += SLOT_INTERVAL) {
      const h = String(Math.floor(start / 60)).padStart(2, '0');
      const m = String(start % 60).padStart(2, '0');
      const time = `${h}:${m}:00`;
      const iso = `${date}T${time}`;
      slots.set(iso, { iso, label: `${h}:${m}` });
    }
  }

  return [...slots.values()].sort((a, b) => a.iso.localeCompare(b.iso));
}

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
  const appointmentDurationMinutes =
    draft.cumulatedServiceDuration ?? SLOT_INTERVAL;

  const { availableDates, calendarBounds, selectedDate, slotsForDay } =
    useMemo(() => {
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

      const rowsForDay = selectedDateId
        ? bookable.filter(
            (row) => row.availability_date.slice(0, 10) === selectedDateId,
          )
        : [];

      const slotsForDay = selectedDateId
        ? buildSlotsForDay(rowsForDay, appointmentDurationMinutes)
        : [];

      return {
        availableDates,
        calendarBounds,
        selectedDate,
        slotsForDay,
      };
    }, [availabilities, selectedDateId, appointmentDurationMinutes]);

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
                  onClick={() => setDraft({ slotISO: slot.iso })}
                >
                  {slot.label}
                </Button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
