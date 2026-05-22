import { z } from 'zod';
import { emailSchema, userRoleSchema, uuidSchema } from '../validators';

export const jwtPayloadSchema = z.object({
  user_pk: uuidSchema,
  user_role: userRoleSchema,
  user_email: emailSchema,
  exp: z.number().int().positive(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export type AuthUser = JwtPayload;
