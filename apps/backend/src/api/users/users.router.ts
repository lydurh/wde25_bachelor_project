import { Hono } from 'hono';
import { getUserById, listUsers } from './users.handler';

const usersRoutes = new Hono();

usersRoutes.get('/', listUsers);
usersRoutes.get('/:id', getUserById);

export { usersRoutes };
