import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { jwtPayloadSchema, type AuthUser } from '@repo/shared';
import { env } from '../lib/env';

type AuthVars = {
  Variables: {
    authUser: AuthUser;
    jwtPayload: AuthUser;
  };
};

export const authMiddleware = createMiddleware<AuthVars>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  const rawPayload = await verify(token, env.JWT_SECRET, 'HS256').catch(
    () => null,
  );

  if (!rawPayload) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const parsed = jwtPayloadSchema.safeParse(rawPayload);

  if (!parsed.success) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (parsed.data.exp <= Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('authUser', parsed.data);
  c.set('jwtPayload', parsed.data);

  return next();
});

export const adminMiddleware = createMiddleware<AuthVars>(async (c, next) => {
  const authUser = c.get('authUser');

  if (authUser.user_role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return next();
});

export const clientMiddleware = createMiddleware<AuthVars>(async (c, next) => {
  const authUser = c.get('authUser');

  if (authUser.user_role !== 'client') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return next();
});

export const selfOrAdminMiddleware = createMiddleware<AuthVars>(
  async (c, next) => {
    const targetId = c.req.param('id');
    const authUser = c.get('authUser');

    if (authUser.user_role !== 'admin' && authUser.user_pk !== targetId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return next();
  },
);
