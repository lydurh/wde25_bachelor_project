import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BookingOutletContext } from '@/views/booking/types';

const DISABLED_DATES = [new Date(2026, 4, 1)];

function parseDateId(id: string): Date {
  const [yearStr, monthStr, dayStr] = id.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
}

function toDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const PLACEHOLDER_SLOTS = [
  { iso: '2026-04-27T10:00:00.000Z', label: '10:00' },
  { iso: '2026-04-27T11:00:00.000Z', label: '11:00' },
  { iso: '2026-04-27T12:30:00.000Z', label: '12:30' },
  { iso: '2026-04-27T14:00:00.000Z', label: '14:00' },
] as const;

export const TimeSelectPage = () => {
  const navigate = useNavigate();
  const { draft, setDraft } = useOutletContext<BookingOutletContext>();
  const [selectedDateId, setSelectedDateId] = useState('2026-04-27');
  const selectedDate = parseDateId(selectedDateId);

  const handleContinue = () => {
    if (draft.slotISO) {
      void navigate('information');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Hvornår
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              setSelectedDateId(toDateId(date));
            }
          }}
          defaultMonth={selectedDate}
          startMonth={new Date(2026, 3, 1)}
          endMonth={new Date(2026, 4, 31)}
          disabled={DISABLED_DATES}
          className="rounded-md border"
        />

        <div className="grid grid-cols-2 gap-3">
          {PLACEHOLDER_SLOTS.map((slot) => {
            const isSelected = draft.slotISO === slot.iso;

            return (
              <Button
                key={slot.iso}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                className="h-12 w-full"
                onClick={() => setDraft({ slotISO: slot.iso })}
              >
                {slot.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!draft.slotISO}
        >
          Fortsæt
        </Button>
      </CardFooter>
    </Card>
  );
};
