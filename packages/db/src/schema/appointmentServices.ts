import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { appointments } from './appointments';
import { services } from './services';

export const appointmentServices = pgTable(
  'appointment_services',
  {
    appointment_fk: uuid('appointment_fk')
      .notNull()
      .references(() => appointments.appointment_pk, { onDelete: 'cascade' }),
    service_fk: uuid('service_fk')
      .notNull()
      .references(() => services.service_pk, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.appointment_fk, table.service_fk] }),
  ],
);
