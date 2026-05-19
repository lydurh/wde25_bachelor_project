import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { JwtPayload } from '@repo/shared';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

type AuthVars = { Variables: { jwtPayload: JwtPayload } };

const selfOrAdmin = createMiddleware<AuthVars>(async (c, next) => {
  const targetId = c.req.param('id');
  const payload = c.get('jwtPayload');
  if (payload.role !== 'admin' && payload.sub !== targetId) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  return next();
});

const usersRoutes = new Hono();

usersRoutes.get('/', authMiddleware, listUsers);
usersRoutes.get('/:id', authMiddleware, getUserById);
usersRoutes.post('/', authMiddleware, adminMiddleware, ...createUser);
usersRoutes.patch('/:id', authMiddleware, adminMiddleware, ...updateUser);
usersRoutes.delete('/:id', authMiddleware, selfOrAdmin, deleteUser);

export { usersRoutes };
