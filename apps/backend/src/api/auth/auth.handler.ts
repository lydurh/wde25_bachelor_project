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

type ForgotPasswordRequest = {
  email?: string;
};

type ResetPasswordRequest = {
  token?: string;
  newPassword?: string;
};

const splitName = (name: string) => {
  const [first_name, ...rest] = name.trim().split(' ');
  return {
    first_name,
    last_name: rest.join(' ') || '',
  };
};

export const signupUser = async (c: Context) => {
  const body = await c.req.json<SignupRequest>();

  const email = body.email?.trim() ?? '';
  const password = body.password?.trim() ?? '';

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
  const body = await c.req.json<LoginRequest>();

  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!email || !password) {
    return c.json({ error: 'Missing required fields: email, password' }, 400);
  }

  const user = authService.login(email, password);

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  return c.json({ data: user }, 200);
};

export const logoutUser = (c: Context) => {
  authService.logout();

  return c.json({ data: { message: 'Logged out successfully' } }, 200);
};

export const verifyEmail = (c: Context) => {
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing token query parameter' }, 400);
  }

  const user = authService.verifyEmail(token);

  if (!user) {
    return c.json({ error: 'Invalid or expired verification token' }, 400);
  }

  return c.json(
    { data: { message: 'Email verified successfully', user } },
    200,
  );
};

export const forgotPasswordUser = async (c: Context) => {
  const body = await c.req.json<ForgotPasswordRequest>();

  const email = body.email?.trim();

  if (!email) {
    return c.json({ error: 'Missing required field: email' }, 400);
  }

  const token = authService.forgotPassword(email);

  if (!token) {
    return c.json({ error: 'User not found or not verified' }, 404);
  }

  return c.json({ data: { resetToken: token } }, 200);
};

export const resetPasswordUser = async (c: Context) => {
  const body = await c.req.json<ResetPasswordRequest>();

  const token = body.token?.trim();
  const newPassword = body.newPassword?.trim();

  if (!token || !newPassword) {
    return c.json(
      { error: 'Missing required fields: token, newPassword' },
      400,
    );
  }

  const success = authService.resetPassword(token, newPassword);

  if (!success) {
    return c.json({ error: 'Invalid or expired reset token' }, 400);
  }

  return c.json({ data: { message: 'Password reset successfully' } }, 200);
};
