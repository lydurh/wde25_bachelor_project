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
  getBookingTotalPriceKr,
  BOOKING_MAX_DISTANCE_KM,
  BOOKING_LOCATION_FEE_KR,
} from '@repo/shared';
import type {
  Appointment,
  BusinessSettings,
  Location,
  User,
} from '@repo/shared';
import { api } from '@/lib/api';
import type { BookingUserLoaderData } from '@/lib/loaders/booking-user';
import type { ServicesLoaderData } from '@/lib/loaders/service';
import {
  getCurrentStep,
  type BookingStepValue,
} from '@/views/booking/booking-steps';
import {
  createBookingGuardContext,
  getNextBookingStep,
  hasSelectedServices,
  hasSelectedUser,
  hasTimeSelection,
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
  /** Who the appointment is for (`selectedCustomer` when admin, else session user). */
  bookingCustomer: User | null;
  adminOrigin: BookingUserLoaderData['adminOrigin'];
  /** Resolved business settings (falls back to compile-time defaults). */
  businessSettings: BusinessSettings;
  currentStep: BookingStepValue;
  continueLabel: string;
  continueDisabled: boolean;
  showLayoutContinue: boolean;
  isSubmitting: boolean;
  handleContinue: () => void;
  setStepFooter: (config: StepFooterConfig) => void;
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  hasSubmittedSuccessfully: boolean;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const matches = useMatches();
  const [draft, setDraftState] = useState<BookingDraft>({});
  const [stepFooter, setStepFooterState] = useState<StepFooterConfig>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] =
    useState(false);

  const currentStep = getCurrentStep(routeLocation.pathname);

  const bookingUserData = useRouteLoaderData<BookingUserLoaderData>('book');
  const adminOrigin: BookingUserLoaderData['adminOrigin'] =
    bookingUserData?.adminOrigin ?? null;
  const businessSettings: BusinessSettings = useMemo(
    () =>
      bookingUserData?.businessSettings ?? {
        location_fee_threshold_km: BOOKING_MAX_DISTANCE_KM,
        location_fee_kr: BOOKING_LOCATION_FEE_KR,
      },
    [bookingUserData?.businessSettings],
  );
  const guardContext = useMemo(
    () => createBookingGuardContext(bookingUserData?.user?.user_pk),
    [bookingUserData?.user?.user_pk],
  );

  const servicesData = useMemo(() => {
    const match = matches.find((m) => m.pathname.endsWith('/service'));
    return match?.data as ServicesLoaderData | undefined;
  }, [matches]);

  const user = bookingUserData?.user ?? null;
  const userLocation = bookingUserData?.location ?? null;

  const bookingCustomer = useMemo((): User | null => {
    if (user?.user_role === 'admin') {
      return draft.selectedCustomer ?? null;
    }
    return user;
  }, [draft.selectedCustomer, user]);

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

  // Navigate to profile only after a successful booking and when the success dialog closes.
  useEffect(() => {
    if (
      currentStep !== 'confirm' ||
      isSubmitting ||
      !hasSubmittedSuccessfully ||
      showSuccessDialog
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      void navigate('/profile');
    }, 0);
    return () => clearTimeout(timer);
  }, [
    showSuccessDialog,
    currentStep,
    isSubmitting,
    hasSubmittedSuccessfully,
    navigate,
  ]);

  useEffect(() => {
    if (currentStep !== 'confirm') {
      setHasSubmittedSuccessfully(false);
    }
  }, [currentStep]);

  const continueDisabled = useMemo(() => {
    if (currentStep === 'confirm') {
      return stepFooter.disabled ?? false;
    }
    if (currentStep === 'service') {
      return !hasSelectedServices(draft);
    }
    if (currentStep === 'user') {
      return !hasSelectedUser(draft, guardContext);
    }
    if (currentStep === 'location') {
      return stepFooter.disabled ?? !draft.address?.trim();
    }
    if (currentStep === 'time') {
      return !hasTimeSelection(draft);
    }
    return true;
  }, [currentStep, draft, guardContext, stepFooter.disabled]);

  const continueLabel = stepFooter.label ?? 'Fortsæt';
  const showLayoutContinue =
    currentStep === 'service' ||
    currentStep === 'user' ||
    currentStep === 'location' ||
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

    if (currentStep === 'confirm') {
      const selectedServices = draft.selectedServices ?? [];
      const appointmentUserPk = bookingCustomer?.user_pk;
      if (!appointmentUserPk || !draft.slotISO || selectedServices.length === 0)
        return;

      const date = draft.slotISO.slice(0, 10);
      const time = draft.slotISO.slice(11, 19);
      const totalPrice = getBookingTotalPriceKr(
        selectedServices,
        draft.locationFeeApplies ?? false,
        businessSettings.location_fee_kr,
      ).toFixed(2);

      setIsSubmitting(true);
      void (async () => {
        try {
          let locationFk = draft.locationFk ?? null;
          const customAddress = draft.address?.trim();

          if (!locationFk && customAddress) {
            const { data: location } = await api.post<{ data: Location }>(
              '/locations/from-address',
              { formattedAddress: customAddress },
            );
            locationFk = location.location_pk;
          }

          const response = await api.post<{ data: Appointment }>(
            '/appointments',
            {
              appointment_user_fk: appointmentUserPk,
              location_fk: locationFk,
              appointment_date: date,
              appointment_time: time,
              appointment_notes: draft.comments?.trim() || null,
              appointment_duration: draft.cumulatedServiceDuration ?? null,
              appointment_total_price: totalPrice,
              services: selectedServices.map((s) => ({
                service_fk: s.id,
                quantity: s.quantity,
              })),
            },
          );

          resetDraft();
          setHasSubmittedSuccessfully(true);
          setShowSuccessDialog(true);
          void api
            .post('/appointments/send-confirmation-email', {
              appointment_pk: response.data.appointment_pk,
              appointment_date: date,
              appointment_time: time,
              user_email: bookingCustomer?.user_email,
            })
            .catch((err: unknown) => {
              console.warn('Failed to send confirmation email', err);
            });
        } catch (err: unknown) {
          console.error('Booking failed', err);
          const apiError = err as { status?: number; message?: string };
          if (apiError?.status === 400 || apiError?.status === 409) {
            console.warn(apiError.message ?? 'Booking validation failed');
          }
        } finally {
          setIsSubmitting(false);
        }
      })();
      return;
    }

    const next = getNextBookingStep(currentStep, guardContext);
    if (next) {
      void navigate(`/book/${next}`);
    }
  }, [
    currentStep,
    guardContext,
    draft.serviceQuantities,
    draft.slotISO,
    draft.selectedServices,
    draft.cumulatedServiceDuration,
    draft.comments,
    draft.locationFk,
    draft.address,
    bookingCustomer,
    draft.locationFeeApplies,
    businessSettings,
    navigate,
    servicesData,
    setDraft,
    resetDraft,
    setHasSubmittedSuccessfully,
  ]);

  return (
    <BookingContext.Provider
      value={{
        draft,
        setDraft,
        resetDraft,
        user,
        location: userLocation,
        bookingCustomer,
        adminOrigin,
        businessSettings,
        currentStep,
        continueLabel,
        continueDisabled,
        showLayoutContinue,
        isSubmitting,
        handleContinue,
        setStepFooter,
        showSuccessDialog,
        setShowSuccessDialog,
        hasSubmittedSuccessfully,
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
