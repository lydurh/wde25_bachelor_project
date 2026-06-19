import { Hono } from 'hono';
import {
  listUsers,
  getUserById,
  searchUsersByName,
  createUser,
  updateUser,
  deleteUser,
} from './users.handler';

import {
  authMiddleware,
  adminMiddleware,
  selfOrAdminMiddleware,
} from '../../middleware';

const usersRoutes = new Hono();

usersRoutes.get('/', authMiddleware, adminMiddleware, listUsers);
usersRoutes.get('/search', authMiddleware, adminMiddleware, searchUsersByName);
usersRoutes.get('/:id', authMiddleware, selfOrAdminMiddleware, getUserById);
usersRoutes.post('/', authMiddleware, adminMiddleware, ...createUser);
usersRoutes.patch('/:id', authMiddleware, selfOrAdminMiddleware, ...updateUser);
usersRoutes.delete('/:id', authMiddleware, selfOrAdminMiddleware, deleteUser);

export { usersRoutes };
