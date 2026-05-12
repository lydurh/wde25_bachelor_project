export { z } from 'zod';
export type { ZodSchema } from 'zod';
export type { User } from './src/types/user';
export type { Appointment } from './src/types/appointments';
export type { CreateAppointmentInput } from './src/schemas/appointment';
export {
  appointmentSchema,
  createAppointmentInputSchema,
  parseAppointment,
} from './src/schemas/appointment';
