import type { BookingServiceLine } from '@repo/shared';

export type { BookingServiceLine };

export type BookingDraft = {
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
    email.includes('@') &&
    !!draft.address?.trim()
  );
}
