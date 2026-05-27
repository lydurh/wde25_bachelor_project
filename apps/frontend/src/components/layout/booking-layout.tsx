import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon,
  ScissorIcon,
  User03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';
import { BookingProvider, useBooking } from '@/views/booking/booking-context';
import {
  canAccessBookingStep,
  canViewBookingStep,
  createBookingGuardContext,
  getBookingRedirectForStep,
} from '@/views/booking/booking-guards';
import {
  BOOKING_STEPS,
  getCurrentStep,
  type BookingStepValue,
} from '@/views/booking/booking-steps';

const BOOKING_TAB_STEPS = [
  { value: 'service', label: 'Services', icon: ScissorIcon },
  { value: 'user', label: 'Bruger', icon: User03Icon },
  { value: 'location', label: 'Lokation', icon: Location01Icon },
  { value: 'time', label: 'Tid', icon: Clock01Icon },
  {
    value: 'confirm',
    label: 'Bekræftelse',
    icon: CheckmarkCircle02Icon,
  },
] as const satisfies ReadonlyArray<{
  value: BookingStepValue;
  label: string;
  icon: IconSvgElement;
}>;

const BOOKING_FLOW_PATH =
  /^\/book\/(service|user|location|information|time|confirm)\/?$/;

function BookingLayoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const showBookingTabs = BOOKING_FLOW_PATH.test(location.pathname);
  const currentStep = getCurrentStep(location.pathname);
  const {
    draft,
    user,
    continueDisabled,
    continueLabel,
    handleContinue,
    showLayoutContinue,
  } = useBooking();

  const guardContext = useMemo(
    () => createBookingGuardContext(user?.user_pk),
    [user?.user_pk],
  );
  const visibleTabSteps = BOOKING_TAB_STEPS.filter((step) =>
    canViewBookingStep(step.value, guardContext),
  );

  const handleTabChange = (value: string) => {
    const step = BOOKING_STEPS.find((s) => s.value === value)?.value;
    if (!step || !canAccessBookingStep(step, draft, guardContext)) {
      return;
    }
    void navigate(`/book/${step}`);
  };

  useEffect(() => {
    if (!showBookingTabs) return;

    if (currentStep === 'user' && auth.isAdmin() && !auth.isAuthenticated()) {
      void navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    const redirect = getBookingRedirectForStep(
      currentStep,
      draft,
      guardContext,
    );
    if (redirect) {
      void navigate(redirect, { replace: true });
    }
  }, [
    currentStep,
    draft,
    guardContext,
    location.pathname,
    navigate,
    showBookingTabs,
  ]);

  return (
    <div className="w-full flex min-h-screen flex-col bg-background">
      <header>
        <Separator />
        {showBookingTabs && (
          <Tabs
            value={currentStep}
            onValueChange={handleTabChange}
            className="w-full mx-auto max-w-5xl px-6 py-4"
          >
            <TabsList variant="line" className="mx-auto gap-6 justify-center">
              {visibleTabSteps.map((step) => (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  disabled={
                    !canAccessBookingStep(step.value, draft, guardContext)
                  }
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
