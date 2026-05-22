import type { Context } from 'hono';
import { createFactory } from 'hono/factory';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import {
  signupInputSchema,
  loginInputSchema,
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
  verifyEmailQuerySchema,
} from '@repo/shared';
import { authService } from './auth.service';
import { env } from '../../lib/env';

const factory = createFactory();

const invalidRequest = (
  result: { success: false; error: { issues: unknown } },
  c: Context,
) => c.json({ error: 'Invalid input', issues: result.error.issues }, 400);

const loginRedirectUrl = (params: Record<string, string>) => {
  const url = new URL('/login', env.FRONTEND_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
};

export const signupUser = factory.createHandlers(
  zValidator('json', signupInputSchema, (result, c) => {
    if (!result.success) {
      return invalidRequest(result, c);
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');

    const result = await authService.signup(input);

    return c.json({ data: result.user }, 201);
  },
);

export const loginUser = factory.createHandlers(
  zValidator('json', loginInputSchema, (result, c) => {
    if (!result.success) {
      return invalidRequest(result, c);
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');

    const user = await authService.login(input);

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await sign(
      {
        user_pk: user.user_pk,
        user_role: user.user_role,
        user_email: user.user_email,
        exp: Math.floor(Date.now() / 1000) + env.JWT_EXPIRES_IN_SECONDS,
      },
      env.JWT_SECRET,
      'HS256',
    );

    return c.json({ data: { token, user } }, 200);
  },
);

export const logoutUser = (c: Context) => {
  authService.logout();

  return c.json({ data: { message: 'Logged out successfully' } }, 200);
};

export const verifyEmail = factory.createHandlers(
  zValidator('query', verifyEmailQuerySchema, (result, c) => {
    if (!result.success) {
      return invalidRequest(result, c);
    }
    return undefined;
  }),
  async (c) => {
    const { token } = c.req.valid('query');

    const user = await authService.verifyEmail(token);

    if (!user) {
      return c.redirect(loginRedirectUrl({ verifyError: '1' }), 302);
    }

    return c.redirect(loginRedirectUrl({ verified: '1' }), 302);
  },
);

export const forgotPasswordUser = factory.createHandlers(
  zValidator('json', forgotPasswordInputSchema, (result, c) => {
    if (!result.success) {
      return invalidRequest(result, c);
    }
    return undefined;
  }),
  async (c) => {
    const { email } = c.req.valid('json');

    await authService.forgotPassword(email);

    return c.json(
      {
        data: {
          message: 'If the email is registered, a reset link has been sent.',
        },
      },
      200,
    );
  },
);

export const resetPasswordUser = factory.createHandlers(
  zValidator('json', resetPasswordInputSchema, (result, c) => {
    if (!result.success) {
      return invalidRequest(result, c);
    }
    return undefined;
  }),
  async (c) => {
    const { token, newPassword } = c.req.valid('json');

    const success = await authService.resetPassword(token, newPassword);

    if (!success) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    return c.json({ data: { message: 'Password reset successfully' } }, 200);
  },
);
