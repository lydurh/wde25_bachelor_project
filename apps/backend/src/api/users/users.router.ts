import { Hono } from 'hono';
// import { createMiddleware } from 'hono/factory';
// import type { JwtPayload } from '@repo/shared';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.handler';
// TODO: re-enable auth middleware
// import { authMiddleware, adminMiddleware } from '../../middleware';

// const selfOrAdmin = createMiddleware<AuthVars>(async (c, next) => {
//   const targetId = c.req.param('id');
//   const payload = c.get('jwtPayload');
//   if (payload.role !== 'admin' && payload.sub !== targetId) {
//     return c.json({ error: 'Forbidden' }, 403);
//   }
//   return next();
// });

const usersRoutes = new Hono();

usersRoutes.get('/', listUsers);
usersRoutes.get('/:id', getUserById);
usersRoutes.post('/', ...createUser);
usersRoutes.patch('/:id', ...updateUser);
usersRoutes.delete('/:id', deleteUser);

export { usersRoutes };
