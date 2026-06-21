import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema, updateUserSchema } from '@repo/shared';
import type { AuthUser } from '@repo/shared';
import { requireUuidParam } from '../../lib/params';
import { usersService } from './users.service';

type AuthVars = {
  Variables: {
    authUser: AuthUser;
    jwtPayload: AuthUser;
  };
};

const factory = createFactory();

export const listUsers = async (c: Context<AuthVars>) => {
  const authUser = c.get('authUser');
  const data = await usersService.list(authUser.user_pk);

  return c.json({ data });
};

export const searchUsersByName = async (c: Context) => {
  const name = c.req.query('name')?.trim() ?? '';
  const data = await usersService.listByName(name);
  return c.json({ data });
};

export const getUserById = async (c: Context) => {
  const userId = requireUuidParam(c.req.param('id'), 'userId');
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
    const userId = requireUuidParam(c.req.param('id'), 'userId');
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
  const userId = requireUuidParam(c.req.param('id'), 'userId');
  const user = await usersService.remove(userId);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  return c.json({ data: user }, 200);
};
