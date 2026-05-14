import { z } from 'zod';

export const getUserByIdParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
