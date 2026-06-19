import { z } from 'zod';

export const APPOINTMENT_STATUSES = [
  'confirmed',
  'cancelled',
  'completed',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

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
  appointment_status: z.enum(APPOINTMENT_STATUSES),
  appointment_created_at: z.string().min(1),
  appointment_updated_at: z.string().min(1).nullable(),
});

// For this we are creating a schema for the input of the create appointment endpoint
export const createAppointmentInputSchema = appointmentSchema
  .pick({
    appointment_user_fk: true,
    location_fk: true,
    appointment_time: true,
    appointment_date: true,
    appointment_notes: true,
    appointment_duration: true,
    appointment_total_price: true,
  })
  .extend({
    services: z
      .array(
        z.object({
          service_fk: z.string().min(1),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1),
  })
  .strict(); // Here we are rejecting unknown keys --> sanitizing the input

/** PATCH body: any subset of create fields + status may be sent. */
export const updateAppointmentInputSchema = createAppointmentInputSchema
  .merge(appointmentSchema.pick({ appointment_status: true }))
  .partial()
  .strict();

/** Service line on an appointment (from `appointment_services` joined with `services`). */
export const appointmentServiceLineSchema = z.object({
  service_fk: z.string().min(1),
  quantity: z.number().int().positive(),
  service_title: z.string().min(1),
  service_description: z.string().nullable(),
  service_duration: z.number().int().positive(),
  service_price: z.string(),
});

/** Location on an appointment (from `appointments.location_fk` joined with `locations`). */
export const appointmentLocationSchema = z.object({
  location_pk: z.string().min(1),
  location_address: z.string().min(1),
  location_postal_code: z.string().nullable(),
  location_city: z.string().min(1),
  location_country: z.string().nullable(),
});

export const appointmentWithServicesSchema = appointmentSchema.extend({
  services: z.array(appointmentServiceLineSchema),
  location: appointmentLocationSchema.nullable(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentServiceLine = z.infer<
  typeof appointmentServiceLineSchema
>;
export type AppointmentLocation = z.infer<typeof appointmentLocationSchema>;
export type AppointmentWithServices = z.infer<
  typeof appointmentWithServicesSchema
>;
export type CreateAppointmentInput = z.infer<
  typeof createAppointmentInputSchema
>;
export type UpdateAppointmentInput = z.infer<
  typeof updateAppointmentInputSchema
>;

// Here we are parsing the input and returning an `Appointment`, or throwing a `ZodError` on failure.
export function parseAppointment(input: unknown): Appointment {
  return appointmentSchema.parse(input);
}

/** Schema for sending a booking confirmation email */
export const sendConfirmationEmailSchema = z.object({
  appointment_pk: z.string().min(1),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  appointment_time: z
    .string()
    .regex(
      /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      'Expected time like HH:MM or HH:MM:SS',
    ),
  user_email: z.string().email().nullable().optional(),
});

export type SendConfirmationEmailInput = z.infer<
  typeof sendConfirmationEmailSchema
>;
