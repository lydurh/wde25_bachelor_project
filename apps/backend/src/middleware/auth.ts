import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import type { JwtPayload } from '@repo/shared';
import { env } from '../lib/env';

declare module 'hono' {
  type ContextVariableMap = {
    jwtPayload: JwtPayload;
  };
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  const payload = await verify(token, env.JWT_SECRET, 'HS256').catch(
    () => null,
  );

  if (
    !payload ||
    typeof payload['sub'] !== 'string' ||
    typeof payload['role'] !== 'string'
  ) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('jwtPayload', {
    sub: payload['sub'],
    role: payload['role'],
    exp: payload['exp'] as number,
  });

  return next();
});

export const adminMiddleware = createMiddleware(async (c, next) => {
  const payload = c.get('jwtPayload');

  if (payload.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return next();
});
