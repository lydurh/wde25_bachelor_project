import type { Context } from 'hono';
import { authService } from './auth.service';

type SignupRequest = {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
};

const splitName = (name: string) => {
  const [first_name, ...rest] = name.trim().split(' ');
  return {
    first_name,
    last_name: rest.join(' ') || '',
  };
};

export const signupUser = async (c: Context) => {
  const body = (await c.req.json()) as SignupRequest;

  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!email || !password || (!body.name && !body.first_name)) {
    return c.json(
      { error: 'Missing required fields: name/first_name, email, password' },
      400,
    );
  }

  const { first_name, last_name } = body.name
    ? splitName(body.name)
    : {
        first_name: body.first_name?.trim() ?? '',
        last_name: body.last_name?.trim() ?? '',
      };

  const newUser = authService.signup(first_name, last_name, email, password);

  return c.json({ data: newUser }, 201);
};
