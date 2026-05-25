import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Contact01Icon,
  Location01Icon,
  ScissorIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingProvider, useBooking } from '@/views/booking/booking-context';
import {
  canAccessBookingStep,
  getBookingRedirectForStep,
} from '@/views/booking/booking-guards';
import {
  BOOKING_STEPS,
  getCurrentStep,
  type BookingStepValue,
} from '@/views/booking/booking-steps';

const BOOKING_TAB_STEPS = [
  { value: 'service', label: 'Services', icon: ScissorIcon },
  { value: 'location', label: 'Lokation', icon: Location01Icon },
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
] as const satisfies ReadonlyArray<{
  value: BookingStepValue;
  label: string;
  icon: typeof ScissorIcon;
}>;

const BOOKING_FLOW_PATH =
  /^\/book\/(service|location|information|time|confirm)\/?$/;

function BookingLayoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const showBookingTabs = BOOKING_FLOW_PATH.test(location.pathname);
  const currentStep = getCurrentStep(location.pathname);
  const {
    draft,
    continueDisabled,
    continueLabel,
    handleContinue,
    showLayoutContinue,
  } = useBooking();

  const handleTabChange = (value: string) => {
    const step = BOOKING_STEPS.find((s) => s.value === value)?.value;
    if (!step || !canAccessBookingStep(step, draft)) {
      return;
    }
    void navigate(`/book/${step}`);
  };

  useEffect(() => {
    if (!showBookingTabs) return;

    const redirect = getBookingRedirectForStep(currentStep, draft);
    if (redirect) {
      void navigate(redirect, { replace: true });
    }
  }, [currentStep, draft, navigate, showBookingTabs]);

  return (
    <div className="w-full flex min-h-screen flex-col bg-background">
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
        {showBookingTabs && (
          <Tabs
            value={currentStep}
            onValueChange={handleTabChange}
            className="w-full mx-auto max-w-5xl px-6 py-4"
          >
            <TabsList variant="line" className="mx-auto gap-6 justify-center">
              {BOOKING_TAB_STEPS.map((step) => (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  disabled={!canAccessBookingStep(step.value, draft)}
                  className="flex-col gap-1 px-4 py-6 text-xs"
                >
                  <HugeiconsIcon icon={step.icon} strokeWidth={2} />
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      {showLayoutContinue && (
        <div className="mx-auto w-full max-w-3xl px-6 pb-8">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={continueDisabled}
          >
            {continueLabel}
          </Button>
        </div>
      )}

      <footer className="mt-auto border-t border-border">
        <p className="py-6 text-center text-xs text-muted-foreground">
          © KEA EXAM PROJECT
        </p>
      </footer>
    </div>
  );
}

export const BookingLayout = () => {
  return (
    <BookingProvider>
      <BookingLayoutContent />
    </BookingProvider>
  );
};
