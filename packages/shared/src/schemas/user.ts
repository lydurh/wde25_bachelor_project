import { z } from 'zod';
import {
  emailSchema,
  nameSchema,
  optionalNameSchema,
  passwordSchema,
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
    user_email: emailSchema.optional(),
    user_first_name: nameSchema({ label: 'First name' }).optional(),
    user_last_name: optionalNameSchema({ label: 'Last name' }).optional(),
    user_location_fk: uuidSchema.optional(),
    user_password: passwordSchema.optional(),
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
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
