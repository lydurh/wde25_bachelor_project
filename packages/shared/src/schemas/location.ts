import { z } from 'zod';

export const createLocationSchema = z
  .object({
    location_address: z.string().min(1).max(255),
    location_postal_code: z.string().length(4).nullable().optional(),
    location_city: z.string().min(1).max(100),
    location_country: z.string().max(100).nullable().optional(),
    location_latitude: z
      .string()
      .regex(/^-?\d{1,3}\.\d{1,6}$/, 'Invalid latitude format')
      .nullable()
      .optional(),
    location_longitude: z
      .string()
      .regex(/^-?\d{1,3}\.\d{1,6}$/, 'Invalid longitude format')
      .nullable()
      .optional(),
  })
  .strict();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
