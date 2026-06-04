import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/ui/button-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';
import { BookingProvider, useBooking } from '@/views/booking/booking-context';
import {
  canAccessBookingStep,
  canViewBookingStep,
  createBookingGuardContext,
  getBookingRedirectForStep,
  getPreviousBookingStep,
} from '@/views/booking/booking-guards';
import {
  BOOKING_STEPS,
  BOOKING_TAB_STEPS,
  getCurrentStep,
} from '@/views/booking/booking-steps';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';

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
    hasSubmittedSuccessfully,
  } = useBooking();

  const guardContext = useMemo(
    () => createBookingGuardContext(user?.user_pk),
    [user?.user_pk],
  );
  const visibleTabSteps = BOOKING_TAB_STEPS.filter((step) =>
    canViewBookingStep(step.value, guardContext),
  );

  const previousStep = useMemo(
    () => getPreviousBookingStep(currentStep, guardContext),
    [currentStep, guardContext],
  );

  const handleGoBack = () => {
    if (!previousStep) return;
    void navigate(`/book/${previousStep}`);
  };

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

    if (currentStep === 'confirm' && hasSubmittedSuccessfully) {
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

        {/* Continue and go back buttons */}
        {showLayoutContinue && (
          <div className="w-full flex justify-center my-6">
            <ButtonGroup>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
                disabled={!previousStep}
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
                Tilbage
              </Button>
              <ButtonGroupSeparator />
              <Button
                type="button"
                variant="outline"
                onClick={handleContinue}
                disabled={continueDisabled}
              >
                {continueLabel}
                <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
              </Button>
            </ButtonGroup>
          </div>
        )}
      </main>
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
