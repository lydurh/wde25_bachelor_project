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

    if (!result) {
      return c.json({ error: 'Email already registered' }, 409);
    }

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
        sub: user.user_pk,
        role: user.user_role,
        exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
      },
      env.JWT_SECRET,
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
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }

    return c.redirect('http://localhost:5173/login');
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

    // Always return 200 regardless of whether email exists — prevents user enumeration
    return c.json(
      {
        data: {
          message:
            'If that email is registered and verified, a reset link has been sent.',
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
