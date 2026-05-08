import { Hono } from 'hono';
import { listUsers } from './users.handler';

const usersRoutes = new Hono();

usersRoutes.get('/', listUsers);

export { usersRoutes };
