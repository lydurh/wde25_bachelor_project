import { relations } from 'drizzle-orm';
import { locations } from './locations';
import { users } from './users';
import { services } from './services';
import { appointments } from './appointments';
import { appointmentServices } from './appointmentServices';

export const locationsRelations = relations(locations, ({ many }) => ({
  users: many(users),
  appointments: many(appointments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  location: one(locations, {
    fields: [users.user_location_fk],
    references: [locations.location_pk],
  }),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointmentServices: many(appointmentServices),
}));

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    user: one(users, {
      fields: [appointments.appointment_user_fk],
      references: [users.user_pk],
    }),
    location: one(locations, {
      fields: [appointments.location_fk],
      references: [locations.location_pk],
    }),
    appointmentServices: many(appointmentServices),
  }),
);

export const appointmentServicesRelations = relations(
  appointmentServices,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentServices.appointment_fk],
      references: [appointments.appointment_pk],
    }),
    service: one(services, {
      fields: [appointmentServices.service_fk],
      references: [services.service_pk],
    }),
  }),
);
