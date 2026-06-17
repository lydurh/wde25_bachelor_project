import { z } from 'zod';
import {
  emailSchema,
  nameSchema,
  optionalNameSchema,
  passwordSchema,
  safeString,
  userRoleSchema,
  uuidSchema,
} from '../validators';

export const getUserByIdParamsSchema = z.object({
  id: uuidSchema,
});

export const createUserSchema = z.object({
  user_email: emailSchema,
  user_first_name: nameSchema({ label: 'First name' }),
  user_last_name: optionalNameSchema({ label: 'Last name' })
    .optional()
    .default(''),
  user_password: passwordSchema,
  user_role: userRoleSchema.optional(),
  user_location_fk: uuidSchema.optional(),
});

export const updateUserSchema = z
  .object({
    user_email: z.email('Invalid email format').max(255).optional(),
    user_first_name: safeString({
      min: 1,
      max: 100,
      label: 'First name',
    }).optional(),
    user_last_name: safeString({
      min: 1,
      max: 100,
      label: 'Last name',
    }).optional(),
    user_location_fk: z.string().uuid('Invalid location ID').optional(),
    user_note: z.string().max(1000, 'Note is too long').nullable().optional(),
    user_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password is too long')
      .regex(/^[^<>\n\r]*$/, 'Invalid characters in password')
      .optional(),
    repeat_password: z.string().optional(),
  })
  .refine((body: Record<string, unknown>) => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  })
  .superRefine(
    (
      data: Record<string, unknown> & {
        user_password?: string | undefined;
        repeat_password?: string | undefined;
      },
      ctx: z.RefinementCtx,
    ) => {
      if (data.user_password) {
        if (!data.repeat_password) {
          ctx.addIssue({
            code: 'custom',
            path: ['repeat_password'],
            message: 'Repeat password is required',
          });
        } else if (data.repeat_password !== data.user_password) {
          ctx.addIssue({
            code: 'custom',
            path: ['repeat_password'],
            message: 'Passwords must match',
          });
        }
      }
    },
  );

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
