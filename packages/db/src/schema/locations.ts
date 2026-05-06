import {
  char,
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const locations = pgTable('locations', {
  location_pk: uuid('location_pk').primaryKey().defaultRandom(),
  location_address: varchar('location_address', { length: 255 }).notNull(),
  location_postal_code: char('location_postal_code', { length: 4 }),
  location_city: varchar('location_city', { length: 100 }).notNull(),
  location_country: varchar('location_country', { length: 100 }),
  location_latitude: decimal('location_latitude', { precision: 9, scale: 6 }),
  location_longitude: decimal('location_longitude', { precision: 9, scale: 6 }),
  location_created_at: timestamp('location_created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  location_updated_at: timestamp('location_updated_at', { withTimezone: true }),
  location_deleted_at: timestamp('location_deleted_at', { withTimezone: true }),
});
