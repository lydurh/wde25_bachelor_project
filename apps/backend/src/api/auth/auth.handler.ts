import type { Context } from 'hono';
import { authService } from './auth.service';

type SignupRequest = {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
};

type LoginRequest = {
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

  const { user, token } = authService.signup(
    first_name,
    last_name,
    email,
    password,
  );

  return c.json({ data: user, verificationToken: token }, 201);
};

export const loginUser = async (c: Context) => {
  const body = (await c.req.json()) as LoginRequest;

  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!email || !password) {
    return c.json(
      { error: 'Missing required fields: email, password' },
      400,
    );
  }

  const user = authService.login(email, password);

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  return c.json({ data: user }, 200);
};

export const logoutUser = async (c: Context) => {
  authService.logout();

  return c.json({ data: { message: 'Logged out successfully' } }, 200);
};

export const verifyEmail = async (c: Context) => {
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing token query parameter' }, 400);
  }

  const user = authService.verifyEmail(token);

  if (!user) {
    return c.json({ error: 'Invalid or expired verification token' }, 400);
  }

  return c.json({ data: { message: 'Email verified successfully', user } }, 200);
};
