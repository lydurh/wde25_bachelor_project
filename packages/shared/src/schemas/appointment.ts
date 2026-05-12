import { z } from 'zod';

/** API / wire shape for an appointment (matches DB intent; PKs are UUID strings in Postgres). */
export const appointmentSchema = z.object({
  appointment_pk: z.string().min(1),
  appointment_user_fk: z.string().min(1),
  location_fk: z.string().min(1).nullable(),
  appointment_time: z
    .string()
    .regex(
      /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      'Expected time like HH:MM or HH:MM:SS',
    ),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  appointment_notes: z.string().nullable(),
  appointment_duration: z.number().int().nonnegative().nullable(),
  appointment_total_price: z.string().nullable(),
  appointment_status: z.string().min(1),
  appointment_created_at: z.string().min(1),
  appointment_updated_at: z.string().min(1).nullable(),
  appointment_deleted_at: z.string().min(1).nullable(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

// Validates `input` and returns an `Appointment`, or throws `ZodError` on failure.
export function parseAppointment(input: unknown): Appointment {
  return appointmentSchema.parse(input);
}
