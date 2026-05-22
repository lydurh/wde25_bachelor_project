import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BookingOutletContext } from '@/views/booking/types';

const PLACEHOLDER_DATES = [
  { id: '2026-04-27', day: 'man', date: 27, disabled: false },
  { id: '2026-04-28', day: 'tir', date: 28, disabled: false },
  { id: '2026-04-29', day: 'ons', date: 29, disabled: false },
  { id: '2026-05-01', day: 'fre', date: 1, disabled: true },
] as const;

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
  const [month, setMonth] = useState('april-2026');

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
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Vælg måned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="april-2026">April 2026</SelectItem>
            <SelectItem value="may-2026">Maj 2026</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Forrige datoer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
            {PLACEHOLDER_DATES.map((day) => {
              const isSelected = selectedDateId === day.id;

              return (
                <button
                  key={day.id}
                  type="button"
                  disabled={day.disabled}
                  onClick={() => setSelectedDateId(day.id)}
                  className={cn(
                    'flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-3 text-sm transition-colors',
                    isSelected && 'border-foreground ring-2 ring-foreground',
                    day.disabled &&
                      'cursor-not-allowed border-border/60 text-muted-foreground opacity-50',
                    !day.disabled &&
                      !isSelected &&
                      'border-border hover:bg-muted/50',
                  )}
                >
                  <span className="text-lg font-semibold tabular-nums">
                    {day.date}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.day}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Næste datoer"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
        </div>

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
