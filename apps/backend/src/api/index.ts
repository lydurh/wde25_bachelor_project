import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';
import { servicesRoutes } from './services/services.router';
import { authRoutes } from './auth/auth.router';
import { appointmentsRouter } from './appointments/appointments.router';
import { locationsRoutes } from './locations/locations.router';
import { availabilityRouter } from './availability/availability.router';

const api = new Hono();

api.route('/health', health);
api.route('/users', usersRoutes);
api.route('/services', servicesRoutes);
api.route('/auth', authRoutes);
api.route('/appointments', appointmentsRouter);
api.route('/locations', locationsRoutes);
api.route('/availability', availabilityRouter);

export { api };
