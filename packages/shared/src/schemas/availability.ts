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

/** API / wire shape for an availability row (matches DB `availability` table). */
export const availabilitySchema = z.object({
  availability_pk: z.string().min(1),
  availability_date: dateString,
  availability_start_time: timeString,
  availability_end_time: timeString,
  availability_type: z.string().min(1).max(50),
  availability_created_at: z.string().min(1),
  availability_updated_at: z.string().min(1).nullable(),
  availability_deleted_at: z.string().min(1).nullable(),
});

export const createAvailabilityInputSchema = availabilitySchema
  .pick({
    availability_date: true,
    availability_start_time: true,
    availability_end_time: true,
    availability_type: true,
  })
  .partial({ availability_type: true })
  .strict();

export const updateAvailabilityInputSchema = createAvailabilityInputSchema
  .partial()
  .strict();

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
