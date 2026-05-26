import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon,
  ScissorIcon,
  User03Icon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

export const BOOKING_STEPS = [
  { value: 'service', label: 'Services' },
  { value: 'user', label: 'Bruger' },
  { value: 'location', label: 'Lokation' },
  { value: 'time', label: 'Tid' },
  { value: 'confirm', label: 'Bekræftelse' },
] as const;

export type BookingStepValue = (typeof BOOKING_STEPS)[number]['value'];

export const BOOKING_TAB_STEPS = [
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

export function getBookingTabStep(value: BookingStepValue) {
  return BOOKING_TAB_STEPS.find((step) => step.value === value);
}

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

export function getPreviousStep(
  step: BookingStepValue,
): BookingStepValue | null {
  const index = STEP_ORDER.indexOf(step);
  if (index <= 0 || index >= STEP_ORDER.length) return null;
  return STEP_ORDER[index - 1] ?? null;
}
