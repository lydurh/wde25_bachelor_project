import type { BookingServiceLine, User } from '@repo/shared';

export type { BookingServiceLine };

export type BookingDraft = {
  /** Customer chosen by admin on the user step (appointment is booked for this person) */
  selectedCustomer?: User | null;
  serviceQuantities?: Record<string, number>;
  /** Snapshot of selected services when quantities are confirmed on the service step */
  selectedServices?: BookingServiceLine[];
  cumulatedServiceDuration?: number;
  slotISO?: string;
  selectedDateId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
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
