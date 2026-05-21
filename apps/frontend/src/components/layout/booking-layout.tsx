import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  isCustomerInfoComplete,
  type BookingDraft,
  type BookingOutletContext,
} from '@/views/booking/types';

const BOOKING_STEPS = [
  { path: 'service', label: 'Service' },
  { path: 'time', label: 'Time' },
  { path: 'information', label: 'Details' },
  { path: 'confirm', label: 'Confirm' },
] as const;

type BookingStepPath = (typeof BOOKING_STEPS)[number]['path'];

const stepValidators: Record<
  BookingStepPath,
  (draft: BookingDraft) => boolean
> = {
  service: (draft) => !!draft.serviceId,
  time: (draft) => !!draft.slotISO,
  information: (draft) => isCustomerInfoComplete(draft),
  confirm: () => true,
};

function getStepIndex(pathname: string): number {
  return BOOKING_STEPS.findIndex((step) => pathname.endsWith(`/${step.path}`));
}

export const BookingLayout = () => {
  const [draft, setDraftState] = useState<BookingDraft>({});
  const navigate = useNavigate();
  const location = useLocation();

  const setDraft = (patch: Partial<BookingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  };

  const resetDraft = () => setDraftState({});

  const outletContext: BookingOutletContext = { draft, setDraft, resetDraft };

  const currentIndex = getStepIndex(location.pathname);
  const currentStep =
    currentIndex >= 0 ? BOOKING_STEPS[currentIndex] : undefined;
  const nextStep = BOOKING_STEPS[currentIndex + 1];
  const previousStep = BOOKING_STEPS[currentIndex - 1];

  const canGoPrevious = currentIndex > 0;
  const canGoNext =
    nextStep != null &&
    currentStep != null &&
    stepValidators[currentStep.path](draft);

  const isLastStep = currentIndex === BOOKING_STEPS.length - 1;

  const handleNext = () => {
    if (!canGoNext || !nextStep) return;
    void navigate(nextStep.path);
  };

  const handlePrevious = () => {
    if (!canGoPrevious || !previousStep) return;
    void navigate(previousStep.path);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-semibold">Book an Appointment</h1>
        <nav
          aria-label="Booking progress"
          className="mt-4 flex flex-wrap gap-2"
        >
          {BOOKING_STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = currentIndex > index;

            return (
              <span
                key={step.path}
                className={cn(
                  'rounded-full px-3 py-1 text-sm',
                  isActive && 'bg-primary text-primary-foreground',
                  isComplete && !isActive && 'bg-muted text-muted-foreground',
                  !isActive &&
                    !isComplete &&
                    'bg-muted/50 text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        <Outlet context={outletContext} />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-3xl justify-between gap-4 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          {!isLastStep ? (
            <Button type="button" onClick={handleNext} disabled={!canGoNext}>
              Next
            </Button>
          ) : (
            <Button type="button" disabled>
              Confirm
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};
