import {
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Single-row table holding global, admin-editable business configuration.
 * Read lazily; a default row is created on first access if none exists.
 */
export const businessSettings = pgTable('business_settings', {
  business_settings_pk: uuid('business_settings_pk')
    .primaryKey()
    .defaultRandom(),
  /** Driving distance (km) from the admin origin before a location fee applies. */
  location_fee_threshold_km: integer('location_fee_threshold_km')
    .notNull()
    .default(15),
  /** Fixed location / travel fee in DKK applied beyond the threshold. */
  location_fee_kr: decimal('location_fee_kr', { precision: 10, scale: 2 })
    .notNull()
    .default('200'),
  business_settings_updated_at: timestamp('business_settings_updated_at', {
    withTimezone: true,
  }),
});
