import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';
import { servicesRoutes } from './services/services.router';

const api = new Hono();

api.route('/health', health);
api.route('/users', usersRoutes);
api.route('/services', servicesRoutes);

export { api };
