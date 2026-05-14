export { z } from 'zod';
export type { ZodSchema } from 'zod';

export type { User } from './src/types/user';
export type { Service } from './src/types/service';
export type { Appointment } from './src/types/appointments';

export type {
  CreateServiceInput,
  UpdateServiceInput,
} from './src/schemas/service';
export {
  createServiceSchema,
  updateServiceSchema,
} from './src/schemas/service';

export type { GetUserByIdParams, UpdateUserInput } from './src/schemas/user';
export { getUserByIdParamsSchema, updateUserSchema } from './src/schemas/user';

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
