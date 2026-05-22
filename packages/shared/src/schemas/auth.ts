import { z } from 'zod';
import type { User } from '../types/user';
import {
  emailSchema,
  loginPasswordSchema,
  nameSchema,
  optionalNameSchema,
  passwordSchema,
  postalCodeSchema,
  safeString,
  uuidSchema,
} from '../validators';

/** POST /auth/signup */
export const signupInputSchema = z
  .object({
    first_name: nameSchema({ label: 'First name' }),
    last_name: optionalNameSchema({ label: 'Last name' }).optional(),
    email: emailSchema,
    password: passwordSchema,
    address: safeString({ min: 1, max: 255, label: 'Address' }),
    postal_code: postalCodeSchema,
    city: safeString({ min: 1, max: 100, label: 'City' }),
  })
  .strict();

export type SignupInput = z.infer<typeof signupInputSchema>;

export const loginInputSchema = z
  .object({
    email: emailSchema,
    password: loginPasswordSchema,
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;

export const forgotPasswordInputSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z
  .object({
    token: uuidSchema,
    newPassword: passwordSchema,
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

/** GET /auth/verify-email?token=… */
export const verifyEmailQuerySchema = z
  .object({
    token: uuidSchema,
  })
  .strict();

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;

/** Auth service result types */
export type SignupResult = {
  user: User;
  verificationToken: string;
};
