export const BOOKING_STEPS = [
  { value: 'service', label: 'Services' },
  { value: 'information', label: 'Information' },
  { value: 'time', label: 'Tid' },
  { value: 'confirm', label: 'Bekræftelse' },
] as const;

export type BookingStepValue = (typeof BOOKING_STEPS)[number]['value'];

const STEP_ORDER = BOOKING_STEPS.map((step) => step.value);

export function getCurrentStep(pathname: string): BookingStepValue {
  const match = BOOKING_STEPS.find((step) =>
    pathname.endsWith(`/${step.value}`),
  );
  return match?.value ?? 'service';
}

export function getNextStep(step: BookingStepValue): BookingStepValue | null {
  const index = STEP_ORDER.indexOf(step);
  if (index < 0 || index >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[index + 1] ?? null;
}
