export { z } from 'zod';
export type { ZodSchema } from 'zod';
export type { User } from './src/types/user';
export type { Appointment } from './src/types/appointments';
export type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './src/schemas/appointment';
export {
  appointmentSchema,
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  parseAppointment,
} from './src/schemas/appointment';

export type { Location } from './src/types/location';
export type { CreateLocationInput } from './src/schemas/location';
export { createLocationSchema } from './src/schemas/location';
