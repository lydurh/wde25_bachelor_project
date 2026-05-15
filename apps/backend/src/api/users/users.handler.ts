import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createUserSchema, updateUserSchema } from '@repo/shared';
import { usersService } from './users.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listUsers = async (c: Context) => {
  const data = await usersService.list();

  return c.json({ data });
};

export const getUserById = async (c: Context) => {
  const userId = c.req.param('id');

  if (!userId || !UUID_REGEX.test(userId)) {
    throw new HTTPException(400, { message: 'Invalid userId parameter' });
  }

  const user = await usersService.getById(userId);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ data: user });
};

export const createUser = async (c: Context) => {
  const body: unknown = await c.req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      400,
    );
  }

  const user = await usersService.create(parsed.data);

  return c.json({ data: user }, 201);
};

export const updateUser = async (c: Context) => {
  const userId = c.req.param('id');

  if (!userId || !UUID_REGEX.test(userId)) {
    throw new HTTPException(400, { message: 'Invalid userId parameter' });
  }

  const body: unknown = await c.req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      400,
    );
  }

  const { repeat_password: _repeat_password, ...updateData } = parsed.data;
  const user = await usersService.update(userId, updateData);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ data: user });
};

export const deleteUser = async (c: Context) => {
  const userId = c.req.param('id');

  if (!userId || !UUID_REGEX.test(userId)) {
    throw new HTTPException(400, { message: 'Invalid userId parameter' });
  }

  const user = await usersService.remove(userId);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.body(null, 204);
};
