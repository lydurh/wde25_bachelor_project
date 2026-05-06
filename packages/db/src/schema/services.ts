import {
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
  service_pk: uuid('service_pk').primaryKey().defaultRandom(),
  service_title: varchar('service_title', { length: 100 }).notNull(),
  service_description: text('service_description'),
  service_duration: integer('service_duration').notNull(),
  service_price: decimal('service_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  service_created_at: timestamp('service_created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  service_updated_at: timestamp('service_updated_at', { withTimezone: true }),
  service_deleted_at: timestamp('service_deleted_at', { withTimezone: true }),
});
