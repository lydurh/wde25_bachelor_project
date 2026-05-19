import { z } from 'zod';

/** POST /auth/signup */
export const signupInputSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().optional(),
    email: z.string().trim().min(1, 'Email is required'),
    password: z.string().trim().min(1, 'Password is required'),
    address: z.string().trim().min(1, 'Address is required'),
    postal_code: z.string().trim().min(4, 'Postal code must be 4 digits'),
    city: z.string().trim().min(1, 'City is required'),
  })
  .strict();

export type SignupInput = z.infer<typeof signupInputSchema>;

export const loginInputSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required'),
    password: z.string().trim().min(1, 'Password is required'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;

export const forgotPasswordInputSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required'),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z
  .object({
    token: z.string().trim().min(1, 'Token is required'),
    newPassword: z.string().trim().min(1, 'New password is required'),
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

/** GET /auth/verify-email?token=… */
export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;
