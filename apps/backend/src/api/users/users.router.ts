import { Hono } from 'hono';
import {
  getUserById,
  listUsers,
  patchUserById,
  deleteUserById,
} from './users.handler';

const usersRoutes = new Hono();

usersRoutes.get('/', listUsers);
usersRoutes.get('/:id', getUserById);
usersRoutes.patch('/:id', patchUserById);
usersRoutes.delete('/:id', deleteUserById);

export { usersRoutes };
