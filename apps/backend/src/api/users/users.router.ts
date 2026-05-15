import { Hono } from 'hono';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.handler';

const usersRoutes = new Hono();

usersRoutes.get('/', listUsers);
usersRoutes.get('/:id', getUserById);
usersRoutes.post('/', createUser);
usersRoutes.patch('/:id', updateUser);
usersRoutes.delete('/:id', deleteUser);

export { usersRoutes };
