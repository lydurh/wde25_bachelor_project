import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { AuthUser } from '@repo/shared';
import {
  listUsers,
  getUserById,
  searchUsersByName,
  createUser,
  updateUser,
  deleteUser,
} from './users.handler';

import { authMiddleware, adminMiddleware } from '../../middleware';

type AuthVars = {
  Variables: {
    authUser: AuthUser;
    jwtPayload: AuthUser;
  };
};

const selfOrAdmin = createMiddleware<AuthVars>(async (c, next) => {
  const targetId = c.req.param('id');
  const authUser = c.get('authUser');
  if (authUser.user_role !== 'admin' && authUser.user_pk !== targetId) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  return next();
});

const usersRoutes = new Hono();

usersRoutes.get('/', authMiddleware, adminMiddleware, listUsers);
usersRoutes.get('/search', authMiddleware, adminMiddleware, searchUsersByName);
usersRoutes.get('/:id', authMiddleware, selfOrAdmin, getUserById);
usersRoutes.post('/', authMiddleware, adminMiddleware, ...createUser);
usersRoutes.patch('/:id', authMiddleware, adminMiddleware, ...updateUser);
usersRoutes.delete('/:id', authMiddleware, selfOrAdmin, deleteUser);

export { usersRoutes };
