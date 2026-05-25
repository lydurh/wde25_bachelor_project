import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  useLocation,
  useMatches,
  useNavigate,
  useRouteLoaderData,
} from 'react-router';

import {
  buildSelectedServiceLines,
  getCumulatedServiceDurationFromQuantities,
} from '@repo/shared';
import type { BookingUserLoaderData } from '@/lib/loaders/booking-user';
import type { ServicesLoaderData } from '@/lib/loaders/service';
import {
  getCurrentStep,
  getNextStep,
  type BookingStepValue,
} from '@/views/booking/booking-steps';
import {
  hasLocationInput,
  hasSelectedServices,
  hasTimeSelection,
  isInformationStepComplete,
} from '@/views/booking/booking-guards';
import type { BookingDraft } from '@/views/booking/types';

type StepFooterConfig = {
  disabled?: boolean;
  label?: string;
};

type BookingContextValue = {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  user: BookingUserLoaderData['user'];
  location: BookingUserLoaderData['location'];
  currentStep: BookingStepValue;
  continueLabel: string;
  continueDisabled: boolean;
  showLayoutContinue: boolean;
  handleContinue: () => void;
  setStepFooter: (config: StepFooterConfig) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const [draft, setDraftState] = useState<BookingDraft>({});
  const [stepFooter, setStepFooterState] = useState<StepFooterConfig>({});

  const currentStep = getCurrentStep(location.pathname);

  const bookingUserData = useRouteLoaderData<BookingUserLoaderData>('book');

  const servicesData = useMemo(() => {
    const match = matches.find((m) => m.pathname.endsWith('/service'));
    return match?.data as ServicesLoaderData | undefined;
  }, [matches]);

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState({});
  }, []);

  const setStepFooter = useCallback((config: StepFooterConfig) => {
    setStepFooterState(config);
  }, []);

  useEffect(() => {
    setStepFooterState({});
  }, [currentStep]);

  const continueDisabled = useMemo(() => {
    if (currentStep === 'confirm') {
      return stepFooter.disabled ?? false;
    }
    if (currentStep === 'information') {
      return stepFooter.disabled ?? !isInformationStepComplete(draft);
    }
    if (currentStep === 'service') {
      return !hasSelectedServices(draft);
    }
    if (currentStep === 'location') {
      return stepFooter.disabled ?? !hasLocationInput(draft);
    }
    if (currentStep === 'time') {
      return !hasTimeSelection(draft);
    }
    return true;
  }, [currentStep, draft, stepFooter.disabled]);

  const continueLabel = stepFooter.label ?? 'Fortsæt';
  const showLayoutContinue =
    currentStep === 'service' ||
    currentStep === 'location' ||
    currentStep === 'information' ||
    currentStep === 'time';

  const handleContinue = useCallback(() => {
    if (currentStep === 'service' && servicesData) {
      const quantities = draft.serviceQuantities ?? {};
      setDraft({
        selectedServices: buildSelectedServiceLines(
          servicesData.services,
          quantities,
        ),
        cumulatedServiceDuration: getCumulatedServiceDurationFromQuantities(
          servicesData.services,
          quantities,
        ),
      });
    }

    const next = getNextStep(currentStep);
    if (next) {
      void navigate(`/book/${next}`);
    }
  }, [currentStep, draft.serviceQuantities, navigate, servicesData, setDraft]);

  return (
    <BookingContext.Provider
      value={{
        draft,
        setDraft,
        resetDraft,
        user: bookingUserData?.user ?? null,
        location: bookingUserData?.location ?? null,
        currentStep,
        continueLabel,
        continueDisabled,
        showLayoutContinue,
        handleContinue,
        setStepFooter,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}

export function useBookingStepFooter(config: StepFooterConfig) {
  const { setStepFooter } = useBooking();

  useEffect(() => {
    setStepFooter(config);
    return () => setStepFooter({});
  }, [config.disabled, config.label, setStepFooter]);
}
