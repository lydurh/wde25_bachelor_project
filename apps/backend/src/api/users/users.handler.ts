import type { Context } from 'hono';
import { getUserByIdParamsSchema } from '@repo/shared';
import { usersService } from './users.service';

export const listUsers = (c: Context) => {
  const users = usersService.list();

  return c.json({ data: users });
};

export const getUserById = (c: Context) => {
  const params = { id: c.req.param('id') ?? '' };
  const parsed = getUserByIdParamsSchema.safeParse(params);

  if (!parsed.success) {
    return c.json(
      { error: 'Invalid user id', issues: parsed.error.issues },
      400,
    );
  }

  const user = usersService.get(parsed.data.id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ data: user }, 200);
};
