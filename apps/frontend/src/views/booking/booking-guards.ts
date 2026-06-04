import { auth } from '@/lib/auth';
import {
  BOOKING_STEPS,
  type BookingStepValue,
} from '@/views/booking/booking-steps';
import type { BookingDraft } from '@/views/booking/types';

const STEP_ORDER = BOOKING_STEPS.map((step) => step.value);

export type BookingRedirectPath = `/book/${(typeof STEP_ORDER)[number]}`;

export type BookingGuardContext = {
  isAdmin: boolean;
  isAuthenticated: boolean;
  loggedInUserPk?: string | null;
};

type StepRequirement = (
  draft: BookingDraft,
  ctx: BookingGuardContext,
) => boolean;

export function createBookingGuardContext(
  loggedInUserPk?: string | null,
): BookingGuardContext {
  return {
    isAdmin: auth.isAdmin(),
    isAuthenticated: auth.isAuthenticated(),
    loggedInUserPk: loggedInUserPk ?? null,
  };
}

export function hasSelectedServices(draft: BookingDraft): boolean {
  const quantities = draft.serviceQuantities ?? {};
  return Object.values(quantities).some((quantity) => quantity > 0);
}

export function hasSelectedUser(
  draft: BookingDraft,
  ctx: BookingGuardContext,
): boolean {
  if (ctx.isAdmin) {
    return !!draft.selectedCustomer?.user_pk?.trim();
  }
  if (ctx.loggedInUserPk?.trim()) {
    return true;
  }
  return !ctx.isAuthenticated;
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
  return draft.policyAccepted === true;
}

const PROGRESS_CHECKS: StepRequirement[] = [
  (draft) => hasSelectedServices(draft),
  hasSelectedUser,
  (draft) => hasLocationInput(draft),
  (draft) => hasTimeSelection(draft),
];

function meetsProgress(
  draft: BookingDraft,
  ctx: BookingGuardContext,
  depth: number,
): boolean {
  return PROGRESS_CHECKS.slice(0, depth).every((check) => check(draft, ctx));
}

function canEnterStep(
  step: BookingStepValue,
  draft: BookingDraft,
  ctx: BookingGuardContext,
): boolean {
  if (step === 'user' && !ctx.isAdmin) {
    return false;
  }
  return meetsProgress(draft, ctx, STEP_ORDER.indexOf(step));
}

export function canViewBookingStep(
  step: BookingStepValue,
  ctx: BookingGuardContext,
): boolean {
  if (step === 'user') {
    return ctx.isAdmin;
  }
  return true;
}

export function canAccessBookingStep(
  step: BookingStepValue,
  draft: BookingDraft,
  ctx: BookingGuardContext,
): boolean {
  if (!canViewBookingStep(step, ctx)) {
    return false;
  }
  return canEnterStep(step, draft, ctx);
}

function getApplicableStepOrder(ctx: BookingGuardContext): BookingStepValue[] {
  return STEP_ORDER.filter((step) => canViewBookingStep(step, ctx));
}

function getStepPrerequisiteRedirect(
  step: BookingStepValue,
  draft: BookingDraft,
  ctx: BookingGuardContext,
): BookingRedirectPath | null {
  const order = getApplicableStepOrder(ctx);
  const stepIndex = order.indexOf(step);
  if (stepIndex <= 0) return null;

  for (let i = 1; i <= stepIndex; i++) {
    const target = order[i]!;
    if (!canEnterStep(target, draft, ctx)) {
      return `/book/${order[i - 1]!}`;
    }
  }

  return null;
}

export function getBookingRedirectForStep(
  step: BookingStepValue,
  draft: BookingDraft,
  ctx: BookingGuardContext,
): BookingRedirectPath | null {
  if (step === 'user' && !ctx.isAdmin) {
    if (!hasSelectedServices(draft)) {
      return '/book/service';
    }
    return (
      getStepPrerequisiteRedirect('location', draft, ctx) ?? '/book/location'
    );
  }

  return getStepPrerequisiteRedirect(step, draft, ctx);
}

export function getNextBookingStep(
  step: BookingStepValue,
  ctx: BookingGuardContext,
): BookingStepValue | null {
  const order = getApplicableStepOrder(ctx);
  const index = order.indexOf(step);
  if (index < 0 || index >= order.length - 1) return null;
  return order[index + 1] ?? null;
}

export function getPreviousBookingStep(
  step: BookingStepValue,
  ctx: BookingGuardContext,
): BookingStepValue | null {
  const order = getApplicableStepOrder(ctx);
  const index = order.indexOf(step);
  if (index <= 0) return null;
  return order[index - 1] ?? null;
}
