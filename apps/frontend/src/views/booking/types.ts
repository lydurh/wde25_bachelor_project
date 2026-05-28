import type { BookingServiceLine, User } from '@repo/shared';

export type { BookingServiceLine };

export type BookingDraft = {
  /** Customer chosen by admin on the user step (appointment is booked for this person) */
  selectedCustomer?: User | null;
  serviceQuantities?: Record<string, number>;
  /** Snapshot of selected services when quantities are confirmed on the service step */
  selectedServices?: BookingServiceLine[];
  cumulatedServiceDuration?: number;
  slotISO?: string | undefined;
  selectedDateId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  /** Driving distance from admin origin (km), set after location step check */
  distanceKm?: number | undefined;
  locationFeeApplies?: boolean;
  distanceCheckStatus?: 'idle' | 'loading' | 'ready' | 'error';
  comments?: string;
  policyAccepted?: boolean;
};

export function isCustomerInfoComplete(draft: BookingDraft): boolean {
  const email = draft.email?.trim();
  return (
    !!draft.firstName?.trim() &&
    !!draft.lastName?.trim() &&
    !!email &&
    email.includes('@')
  );
}
