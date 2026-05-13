import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';
import { authRoutes } from './auth/auth.router';
import { appointmentsRouter } from './appointments/appointments.router';

const api = new Hono();

api.route('/health', health);
api.route('/users', usersRoutes);
api.route('/auth', authRoutes);
api.route('/appointments', appointmentsRouter);

export { api };
