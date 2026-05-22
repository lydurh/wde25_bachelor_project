import { z } from 'zod';
import { postalCodeSchema, safeString } from '../validators';

export const createLocationSchema = z
  .object({
    location_address: safeString({ min: 1, max: 255, label: 'Address' }),
    location_postal_code: postalCodeSchema.nullable().optional(),
    location_city: safeString({ min: 1, max: 100, label: 'City' }),
    location_country: safeString({ min: 1, max: 100, label: 'Country' })
      .nullable()
      .optional(),
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
