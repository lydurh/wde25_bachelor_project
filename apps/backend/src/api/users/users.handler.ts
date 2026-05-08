import type { Context } from 'hono';
import { usersService } from './users.service';

export const listUsers = (c: Context) => {
  const users = usersService.list();

  return c.json({ data: users });
};
