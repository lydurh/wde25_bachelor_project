import { db, businessSettings, eq } from '@repo/db';
import type {
  BusinessSettings,
  UpdateBusinessSettingsInput,
} from '@repo/shared';

type BusinessSettingsRow = typeof businessSettings.$inferSelect;

/** DB row → public API shape (numeric columns come back as strings). */
function toBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    location_fee_threshold_km: row.location_fee_threshold_km,
    location_fee_kr: Number(row.location_fee_kr),
  };
}

export const businessSettingsService = {
  /** Returns the single settings row, creating it with defaults if absent. */
  async get(): Promise<BusinessSettings> {
    const [row] = await db.select().from(businessSettings).limit(1);
    if (row) {
      return toBusinessSettings(row);
    }

    const [created] = await db.insert(businessSettings).values({}).returning();
    if (!created) {
      throw new Error('Failed to initialise business settings');
    }
    return toBusinessSettings(created);
  },

  async update(input: UpdateBusinessSettingsInput): Promise<BusinessSettings> {
    // Ensure the single row exists before updating.
    await this.get();

    const [existing] = await db.select().from(businessSettings).limit(1);
    if (!existing) {
      throw new Error('Business settings row missing');
    }

    const [updated] = await db
      .update(businessSettings)
      .set({
        ...(input.location_fee_threshold_km !== undefined
          ? { location_fee_threshold_km: input.location_fee_threshold_km }
          : {}),
        ...(input.location_fee_kr !== undefined
          ? { location_fee_kr: String(input.location_fee_kr) }
          : {}),
        business_settings_updated_at: new Date(),
      })
      .where(
        eq(
          businessSettings.business_settings_pk,
          existing.business_settings_pk,
        ),
      )
      .returning();

    if (!updated) {
      throw new Error('Failed to update business settings');
    }
    return toBusinessSettings(updated);
  },
};
