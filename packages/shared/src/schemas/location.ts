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

export const locationDistanceCheckInputSchema = z
  .object({
    destinationAddress: z.string().trim().min(1),
  })
  .strict();

export const locationDistanceCheckResultSchema = z.object({
  distanceKm: z.number().nonnegative(),
  appliesLocationFee: z.boolean(),
});

export type LocationDistanceCheckInput = z.infer<
  typeof locationDistanceCheckInputSchema
>;
export type LocationDistanceCheckResult = z.infer<
  typeof locationDistanceCheckResultSchema
>;

export const adminOriginSchema = z.object({
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});

export type AdminOrigin = z.infer<typeof adminOriginSchema>;

export function parseAdminOrigin(value: unknown): AdminOrigin | null {
  const result = adminOriginSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function toLocationBiasCenter(
  adminOrigin: AdminOrigin | null,
): { lat: number; lng: number } | null {
  if (!adminOrigin) return null;
  return { lat: adminOrigin.lat, lng: adminOrigin.lng };
}
