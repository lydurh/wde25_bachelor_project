import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';

const api = new Hono();

api.route('/health', health);
api.route('/users', usersRoutes);

export { api };
