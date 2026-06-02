export { z } from 'zod';
export type { ZodSchema } from 'zod';

export {
  uuidSchema,
  emailSchema,
  passwordSchema,
  loginPasswordSchema,
  nameSchema,
  optionalNameSchema,
  postalCodeSchema,
  safeString,
  userRoleSchema,
  escapeHtml,
} from './src/validators';

export type { User, UserRow, AdminUser } from './src/types/user';
export { toPublicUser, toAdminUser } from './src/types/user';
export type { Service } from './src/types/service';
export {
  BOOKING_LOCATION_FEE_KR,
  BOOKING_MAX_DISTANCE_KM,
} from './src/booking/constants';
export type { LocationAddressParts } from './src/booking/location';
export {
  appliesLocationFee,
  formatLocationAddress,
} from './src/booking/location';
export type { BookingServiceLine } from './src/booking/calculation';
export {
  buildSelectedServiceLines,
  getBookingTotalPriceKr,
  getCumulatedServiceDuration,
  getCumulatedServiceDurationFromQuantities,
  getLinePriceKr,
  getTotalPriceKr,
} from './src/booking/calculation';
export type { Appointment } from './src/types/appointments';

export type { JwtPayload, AuthUser } from './src/schemas/jwt';
export { jwtPayloadSchema } from './src/schemas/jwt';

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
  SendConfirmationEmailInput,
  AppointmentServiceLine,
  AppointmentWithServices,
} from './src/schemas/appointment';
export {
  APPOINTMENT_STATUSES,
  appointmentSchema,
  appointmentServiceLineSchema,
  appointmentWithServicesSchema,
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  sendConfirmationEmailSchema,
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
export type {
  AdminOrigin,
  CreateLocationInput,
  LocationDistanceCheckInput,
  LocationDistanceCheckResult,
} from './src/schemas/location';
export {
  adminOriginSchema,
  createLocationSchema,
  locationDistanceCheckInputSchema,
  locationDistanceCheckResultSchema,
  parseAdminOrigin,
  toLocationBiasCenter,
} from './src/schemas/location';

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
