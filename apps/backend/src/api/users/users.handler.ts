import type { Context } from 'hono';
import { getUserByIdParamsSchema, updateUserSchema } from '@repo/shared';
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

export const patchUserById = async (c: Context) => {
  const params = { id: c.req.param('id') ?? '' };
  const parsedParams = getUserByIdParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return c.json(
      { error: 'Invalid user id', issues: parsedParams.error.issues },
      400,
    );
  }

  const body: unknown = await c.req.json();
  const parsedBody = updateUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return c.json(
      { error: 'Invalid request body', issues: parsedBody.error.issues },
      400,
    );
  }

  const user = usersService.update(parsedParams.data.id, parsedBody.data);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ data: user }, 200);
};
