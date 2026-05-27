export type BookingDraft = {
  serviceId?: string;
  slotISO?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

export type BookingOutletContext = {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
};

export function isCustomerInfoComplete(draft: BookingDraft): boolean {
  const email = draft.email?.trim();
  return (
    !!draft.firstName?.trim() &&
    !!draft.lastName?.trim() &&
    !!email &&
    email.includes('@') &&
    !!draft.address?.trim() &&
    !!draft.city?.trim() &&
    !!draft.postalCode?.trim()
  );
}
