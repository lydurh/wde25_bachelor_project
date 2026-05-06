import {
  date,
  decimal,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { locations } from './locations';

export const appointments = pgTable(
  'appointments',
  {
    appointment_pk: uuid('appointment_pk').primaryKey().defaultRandom(),
    appointment_user_fk: uuid('appointment_user_fk')
      .notNull()
      .references(() => users.user_pk, { onDelete: 'cascade' }),
    location_fk: uuid('location_fk').references(() => locations.location_pk, {
      onDelete: 'set null',
    }),
    appointment_time: time('appointment_time').notNull(),
    appointment_date: date('appointment_date').notNull(),
    appointment_notes: text('appointment_notes'),
    appointment_duration: integer('appointment_duration'),
    appointment_total_price: decimal('appointment_total_price', {
      precision: 10,
      scale: 2,
    }),
    appointment_status: varchar('appointment_status', { length: 50 })
      .notNull()
      .default('pending'),
    appointment_created_at: timestamp('appointment_created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    appointment_updated_at: timestamp('appointment_updated_at', {
      withTimezone: true,
    }),
    appointment_deleted_at: timestamp('appointment_deleted_at', {
      withTimezone: true,
    }),
  },
  (table) => [index('idx_appointments_user_fk').on(table.appointment_user_fk)],
);
