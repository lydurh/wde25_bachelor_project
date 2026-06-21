import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import { format, parse, startOfDay } from 'date-fns';
import type { Availability } from '@repo/shared';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  InformationCircleIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';

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
  // Soft-deleted rows are already filtered out server-side.
  return row.availability_type === 'available';
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
  const [slotError, setSlotError] = useState(false);

  const fetchSlots = useCallback(
    async (date: string) => {
      if (!customerAddress) return;
      setLoading(true);
      setSlotError(false);
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
        setSlotError(true);
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
                setDraft({
                  selectedDateId: format(date, DATE_ID_FORMAT),
                  slotISO: undefined,
                });
              }
            }}
            defaultMonth={selectedDate ?? calendarBounds.startMonth}
            startMonth={calendarBounds.startMonth}
            endMonth={calendarBounds.endMonth}
            disabled={(date) => {
              const today = startOfDay(new Date());
              return (
                date < today ||
                !availableDates.has(format(date, DATE_ID_FORMAT))
              );
            }}
            className="rounded-md border h-full w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {!selectedDateId ? (
            <div className="col-span-full flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-5 shrink-0"
                strokeWidth={2}
              />
              Vælg en dato for at se ledige tider.
            </div>
          ) : loading ? (
            <div className="col-span-full flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground animate-pulse">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-5 shrink-0"
                strokeWidth={2}
              />
              Henter ledige tider...
            </div>
          ) : slotError ? (
            <div className="col-span-full flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              <HugeiconsIcon
                icon={Alert02Icon}
                className="size-5 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <span>
                Der opstod en fejl ved hentning af tider. Prøv igen senere.
              </span>
            </div>
          ) : slotsForDay.length === 0 ? (
            <div className="col-span-full space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="size-5 shrink-0"
                  strokeWidth={2}
                />
                Ingen ledige tider på den valgte dato.
              </div>
              {serviceDuration > 30 && (
                <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-50/50 p-4 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    className="size-5 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span>
                    Dine valgte services har en samlet varighed på{' '}
                    <strong>{serviceDuration} minutter</strong>. Det kan være
                    svært at finde en ledig tid, der passer. Prøv at vælge færre
                    services eller en anden dato.
                  </span>
                </div>
              )}
            </div>
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
