import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Contact01Icon,
  ScissorIcon,
} from '@hugeicons/core-free-icons';

import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { BookingDraft, BookingOutletContext } from '@/views/booking/types';

const BOOKING_STEPS = [
  { value: 'service', label: 'Services', icon: ScissorIcon },
  { value: 'time', label: 'Tid', icon: Clock01Icon },
  {
    value: 'information',
    label: 'Information',
    icon: Contact01Icon,
  },
  {
    value: 'confirm',
    label: 'Bekræftelse',
    icon: CheckmarkCircle02Icon,
  },
] as const;

type BookingStepValue = (typeof BOOKING_STEPS)[number]['value'];

function getCurrentStep(pathname: string): BookingStepValue {
  const match = BOOKING_STEPS.find((step) =>
    pathname.endsWith(`/${step.value}`),
  );
  return match?.value ?? 'service';
}

export const BookingLayout = () => {
  const [draft, setDraftState] = useState<BookingDraft>({});
  const location = useLocation();
  const navigate = useNavigate();
  const currentStep = getCurrentStep(location.pathname);
  const isInformationStep = currentStep === 'information';
  const isConfirmationStep = currentStep === 'confirm';

  const setDraft = (patch: Partial<BookingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  };

  const resetDraft = () => setDraftState({});

  const outletContext: BookingOutletContext = { draft, setDraft, resetDraft };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-md bg-muted" aria-hidden />
            <span className="text-sm font-medium">logo text</span>
          </div>
          <nav
            className="flex items-center gap-6 text-sm"
            aria-label="Hovedmenu"
          >
            <Link
              to="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Link 3
            </Link>
            <Link
              to="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Link 4
            </Link>
          </nav>
        </div>
        <Separator />
        <Tabs
          value={currentStep}
          onValueChange={(value) => {
            void navigate(value);
          }}
          className="w-full mx-auto max-w-5xl px-6 py-4"
        >
          <TabsList variant="line" className="mx-auto gap-6 justify-center">
            {BOOKING_STEPS.map((step) => (
              <TabsTrigger
                key={step.value}
                value={step.value}
                className="flex-col gap-1 px-4 py-6 text-xs"
              >
                <HugeiconsIcon icon={step.icon} strokeWidth={2} />
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-6 py-8',
          isInformationStep && 'max-w-5xl',
          !isInformationStep && !isConfirmationStep && 'max-w-3xl',
          isConfirmationStep && 'max-w-lg',
        )}
      >
        <Outlet context={outletContext} />
      </main>

      <footer className="mt-auto border-t border-border">
        <p className="py-6 text-center text-xs text-muted-foreground">
          © KEA EXAM PROJECT
        </p>
      </footer>
    </div>
  );
};
