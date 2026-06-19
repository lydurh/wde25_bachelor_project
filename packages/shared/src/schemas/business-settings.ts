import { z } from 'zod';

/** API shape for global business settings returned to clients. */
export const businessSettingsSchema = z.object({
  location_fee_threshold_km: z.number().int().nonnegative(),
  location_fee_kr: z.number().nonnegative(),
});

export type BusinessSettings = z.infer<typeof businessSettingsSchema>;

/** PATCH body: any subset of the editable settings. */
export const updateBusinessSettingsSchema = businessSettingsSchema
  .partial()
  .strict();

export type UpdateBusinessSettingsInput = z.infer<
  typeof updateBusinessSettingsSchema
>;

export function parseBusinessSettings(input: unknown): BusinessSettings {
  return businessSettingsSchema.parse(input);
}
