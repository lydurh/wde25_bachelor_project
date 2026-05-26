import {
  BOOKING_STEPS,
  type BookingStepValue,
} from '@/views/booking/booking-steps';
import type { BookingDraft } from '@/views/booking/types';
import { isCustomerInfoComplete } from '@/views/booking/types';

const STEP_ORDER = BOOKING_STEPS.map((step) => step.value);

export type BookingRedirectPath = `/book/${(typeof STEP_ORDER)[number]}`;

export function hasSelectedServices(draft: BookingDraft): boolean {
  const quantities = draft.serviceQuantities ?? {};
  return Object.values(quantities).some((quantity) => quantity > 0);
}

export function hasSelectedUser(draft: BookingDraft): boolean {
  return !!draft.selectedCustomer?.user_pk?.trim();
}

export function hasLocationInput(draft: BookingDraft): boolean {
  return !!draft.address?.trim();
}

export function hasTimeSelection(draft: BookingDraft): boolean {
  const dateId = draft.selectedDateId;
  const slot = draft.slotISO;
  if (!dateId || !slot) return false;
  return slot.startsWith(`${dateId}T`);
}

export function isInformationStepComplete(draft: BookingDraft): boolean {
  return isCustomerInfoComplete(draft) && draft.policyAccepted === true;
}

const canEnter: Record<BookingStepValue, (draft: BookingDraft) => boolean> = {
  service: () => true,
  user: hasSelectedServices,
  location: (draft) => hasSelectedServices(draft) && hasSelectedUser(draft),
  time: (draft) =>
    hasSelectedServices(draft) &&
    hasSelectedUser(draft) &&
    hasLocationInput(draft),
  information: (draft) =>
    hasSelectedServices(draft) &&
    hasSelectedUser(draft) &&
    hasLocationInput(draft) &&
    hasTimeSelection(draft),
  confirm: (draft) =>
    hasSelectedServices(draft) &&
    hasSelectedUser(draft) &&
    hasLocationInput(draft) &&
    hasTimeSelection(draft) &&
    isInformationStepComplete(draft),
};

export function canAccessBookingStep(
  step: BookingStepValue,
  draft: BookingDraft,
): boolean {
  return canEnter[step](draft);
}

export function getBookingRedirectForStep(
  step: BookingStepValue,
  draft: BookingDraft,
): BookingRedirectPath | null {
  const stepIndex = STEP_ORDER.indexOf(step);
  if (stepIndex <= 0) return null;

  for (let i = 1; i <= stepIndex; i++) {
    const target = STEP_ORDER[i]!;
    if (!canEnter[target](draft)) {
      return `/book/${STEP_ORDER[i - 1]!}`;
    }
  }

  return null;
}
