import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { locations } from './locations';

export const users = pgTable('users', {
  user_pk: uuid('user_pk').primaryKey().defaultRandom(),
  user_role: varchar('user_role', { length: 50 }).notNull().default('client'),
  user_email: varchar('user_email', { length: 255 }).notNull().unique(),
  user_first_name: varchar('user_first_name', { length: 20 }).notNull(),
  user_last_name: varchar('user_last_name', { length: 20 }).notNull(),
  user_location_fk: uuid('user_location_fk').references(
    () => locations.location_pk,
    { onDelete: 'set null' },
  ),
  user_password: varchar('user_password', { length: 255 }).notNull(),
  user_note: text('user_note'),
  user_created_at: timestamp('user_created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  user_updated_at: timestamp('user_updated_at', { withTimezone: true }),
  user_deleted_at: timestamp('user_deleted_at', { withTimezone: true }),
  user_verified_at: timestamp('user_verified_at', { withTimezone: true }),
});
