export { z } from 'zod';
export type { ZodSchema } from 'zod';

export { uuidSchema } from './src/schemas/common';

export type { User, UserRow } from './src/types/user';
export { toPublicUser } from './src/types/user';
export type { Service } from './src/types/service';
export type { Appointment } from './src/types/appointments';
export type { JwtPayload } from './src/types/jwt';

export type {
  CreateServiceInput,
  UpdateServiceInput,
} from './src/schemas/service';
export {
  createServiceSchema,
  updateServiceSchema,
} from './src/schemas/service';

export type {
  GetUserByIdParams,
  CreateUserInput,
  UpdateUserInput,
} from './src/schemas/user';
export {
  getUserByIdParamsSchema,
  createUserSchema,
  updateUserSchema,
} from './src/schemas/user';

export type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatus,
} from './src/schemas/appointment';
export {
  APPOINTMENT_STATUSES,
  appointmentSchema,
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  parseAppointment,
} from './src/schemas/appointment';

export type {
  Availability,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
} from './src/schemas/availability';
export {
  availabilitySchema,
  createAvailabilityInputSchema,
  updateAvailabilityInputSchema,
  parseAvailability,
} from './src/schemas/availability';

export type { Location } from './src/types/location';
export type { CreateLocationInput } from './src/schemas/location';
export { createLocationSchema } from './src/schemas/location';

export type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailQuery,
  SignupResult,
} from './src/schemas/auth';
export {
  signupInputSchema,
  loginInputSchema,
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
  verifyEmailQuerySchema,
} from './src/schemas/auth';
