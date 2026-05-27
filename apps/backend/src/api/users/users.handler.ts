import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema, updateUserSchema, uuidSchema } from '@repo/shared';
import { usersService } from './users.service';

const factory = createFactory();

function requireUserId(id: string | undefined): string {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new HTTPException(400, { message: 'Invalid userId parameter' });
  }
  return id;
}

export const listUsers = async (c: Context) => {
  const data = await usersService.list();

  return c.json({ data });
};

export const searchUsersByName = async (c: Context) => {
  const name = c.req.query('name')?.trim() ?? '';
  const data = await usersService.listByName(name);
  return c.json({ data });
};

export const getUserById = async (c: Context) => {
  const userId = requireUserId(c.req.param('id'));
  const user = await usersService.getById(userId);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ data: user });
};

export const createUser = factory.createHandlers(
  zValidator('json', createUserSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');
    const user = await usersService.create(input);

    return c.json({ data: user }, 201);
  },
);

export const updateUser = factory.createHandlers(
  zValidator('json', updateUserSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const userId = requireUserId(c.req.param('id'));
    const input = c.req.valid('json');
    const { repeat_password: _repeat_password, ...updateData } = input;
    const user = await usersService.update(userId, updateData);

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({ data: user });
  },
);

export const deleteUser = async (c: Context) => {
  const userId = requireUserId(c.req.param('id'));
  const user = await usersService.remove(userId);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ data: user }, 200);
};
