import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';
import { servicesRoutes } from './services/services.router';
import { authRoutes } from './auth/auth.router';
import { appointmentsRoutes } from './appointments/appointments.router';
import { locationsRoutes } from './locations/locations.router';
import { availabilityRoutes } from './availability/availability.router';
import { businessSettingsRoutes } from './business-settings/business-settings.router';

const api = new Hono();

api.route('/health', health);
api.route('/auth', authRoutes);

api.route('/users', usersRoutes);
api.route('/services', servicesRoutes);
api.route('/appointments', appointmentsRoutes);
api.route('/locations', locationsRoutes);
api.route('/availability', availabilityRoutes);
api.route('/business-settings', businessSettingsRoutes);

export { api };
