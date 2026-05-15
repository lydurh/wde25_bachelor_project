import { z } from 'zod';

const safeString = z
  .string()
  .trim()
  .min(1, 'Field is required')
  .max(255, 'Field is too long')
  .regex(/^[^<>]*$/, 'HTML tags are not allowed');

export const getUserByIdParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const updateUserSchema = z
  .object({
    user_email: z.string().email('Invalid email format').max(255).optional(),
    user_first_name: safeString
      .min(1, 'First name is required')
      .max(100)
      .optional(),
    user_last_name: safeString
      .min(1, 'Last name is required')
      .max(100)
      .optional(),
    user_location_fk: z.string().uuid('Invalid location ID').optional(),
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
            code: z.ZodIssueCode.custom,
            path: ['repeat_password'],
            message: 'Repeat password is required',
          });
        } else if (data.repeat_password !== data.user_password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['repeat_password'],
            message: 'Passwords must match',
          });
        }
      }
    },
  );

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
