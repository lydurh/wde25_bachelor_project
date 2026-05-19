import type { Context } from 'hono';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import {
  signupInputSchema,
  loginInputSchema,
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
  verifyEmailQuerySchema,
} from '@repo/shared';
import { authService } from './auth.service';

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
    const input = signupInputSchema.parse(c.req.valid('json'));

    const result = await authService.signup(
      input.first_name,
      input.last_name ?? '',
      input.email,
      input.password,
      input.address,
      input.postal_code,
      input.city,
    );

    if (!result) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    return c.json({ data: result.user, verificationToken: result.token }, 201);
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
    const { email, password } = loginInputSchema.parse(c.req.valid('json'));

    const user = await authService.login(email, password);

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    return c.json({ data: user }, 200);
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
    const { token } = verifyEmailQuerySchema.parse(c.req.valid('query'));

    const user = await authService.verifyEmail(token);

    if (!user) {
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }

    return c.json(
      { data: { message: 'Email verified successfully', user } },
      200,
    );
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
    const { email } = forgotPasswordInputSchema.parse(c.req.valid('json'));

    const token = await authService.forgotPassword(email);

    if (!token) {
      return c.json({ error: 'User not found or not verified' }, 404);
    }

    return c.json({ data: { resetToken: token } }, 200);
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
    const { token, newPassword } = resetPasswordInputSchema.parse(
      c.req.valid('json'),
    );

    const success = await authService.resetPassword(token, newPassword);

    if (!success) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    return c.json({ data: { message: 'Password reset successfully' } }, 200);
  },
);
