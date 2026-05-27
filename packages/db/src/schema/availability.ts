import { date, pgTable, time, timestamp, uuid } from 'drizzle-orm/pg-core';

export const availability = pgTable('availability', {
  availability_pk: uuid('availability_pk').primaryKey().defaultRandom(),
  availability_date: date('availability_date').notNull(),
  availability_start_time: time('availability_start_time').notNull(),
  availability_end_time: time('availability_end_time').notNull(),
  availability_created_at: timestamp('availability_created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  availability_updated_at: timestamp('availability_updated_at', {
    withTimezone: true,
  }),
  availability_deleted_at: timestamp('availability_deleted_at', {
    withTimezone: true,
  }),
});
