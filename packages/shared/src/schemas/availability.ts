import { z } from 'zod';

const timeString = z
  .string()
  .regex(
    /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    'Expected time like HH:MM or HH:MM:SS',
  );

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const AVAILABILITY_TYPES = ['available', 'blocked'] as const;
export type AvailabilityType = (typeof AVAILABILITY_TYPES)[number];

/** API / wire shape for an availability row (matches DB `availability` table). */
export const availabilitySchema = z.object({
  availability_pk: z.string().min(1),
  availability_date: dateString,
  availability_start_time: timeString,
  availability_end_time: timeString,
  availability_type: z.enum(AVAILABILITY_TYPES),
  availability_created_at: z.string().min(1),
  availability_updated_at: z.string().min(1).nullable(),
});

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function validateTimeRange(data: {
  availability_start_time?: string | undefined;
  availability_end_time?: string | undefined;
}): boolean {
  if (!data.availability_start_time || !data.availability_end_time) return true;
  return (
    parseTimeMinutes(data.availability_start_time) <
    parseTimeMinutes(data.availability_end_time)
  );
}

const timeRangeRefinement = {
  message: 'availability_start_time must be before availability_end_time',
  path: ['availability_end_time'] as [string],
};

const _createAvailabilityBase = availabilitySchema
  .pick({
    availability_date: true,
    availability_start_time: true,
    availability_end_time: true,
    availability_type: true,
  })
  .partial({ availability_type: true })
  .strict();

const _updateAvailabilityBase = _createAvailabilityBase.partial().strict();

export const createAvailabilityInputSchema = _createAvailabilityBase.refine(
  validateTimeRange,
  timeRangeRefinement,
);

export const updateAvailabilityInputSchema = _updateAvailabilityBase.refine(
  validateTimeRange,
  timeRangeRefinement,
);

export type Availability = z.infer<typeof availabilitySchema>;
export type CreateAvailabilityInput = z.infer<
  typeof createAvailabilityInputSchema
>;
export type UpdateAvailabilityInput = z.infer<
  typeof updateAvailabilityInputSchema
>;

export function parseAvailability(input: unknown): Availability {
  return availabilitySchema.parse(input);
}
