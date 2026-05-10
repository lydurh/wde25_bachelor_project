import { Hono } from 'hono';
import { health } from './health';
import { usersRoutes } from './users/users.router';
import { authRoutes } from './auth/auth.router';

const api = new Hono();

api.route('/health', health);
api.route('/users', usersRoutes);
api.route('/auth', authRoutes);

export { api };
