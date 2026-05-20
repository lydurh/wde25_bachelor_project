import { z } from 'zod';

export const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.string(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
