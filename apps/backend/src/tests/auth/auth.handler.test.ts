import { describe, it, expect, afterAll } from 'bun:test';
import { app } from '../../app';
import { authService } from '../../api/auth/auth.service';
import { db, users, like } from '@repo/db';
import type { User } from '@repo/shared';

type UserResponse = { data: User };
type LoginResponse = { data: { token: string; user: User } };

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

afterAll(async () => {
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
});

describe('POST /api/auth/signup', () => {
  it('should return 201 with valid input', async () => {
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'TEST',
        last_name: 'SignupHandler',
        email: 'TEST_handler_signup@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    });
    const body = (await res.json()) as UserResponse;

    expect(res.status).toBe(201);
    expect(body.data.user_email).toBe('TEST_handler_signup@example.com');
  });

  it('should return 409 when email is already registered', async () => {
    await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'TEST',
        last_name: 'Dup',
        email: 'TEST_handler_signup_dup@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    });

    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'TEST',
        last_name: 'Dup2',
        email: 'TEST_handler_signup_dup@example.com',
        password: 'password456',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    });
    expect(res.status).toBe(409);
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: 'TEST' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 with empty body', async () => {
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('should not return user_password in the response', async () => {
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'TEST',
        last_name: 'NoPwd',
        email: 'TEST_handler_nopwd@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    });
    const body = (await res.json()) as { data: Record<string, unknown> };
    expect(body['data']['user_password']).toBeUndefined();
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 with token and user after successful login', async () => {
    const { token: verifyToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'LoginHandler',
        email: 'TEST_handler_login@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verifyToken);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'TEST_handler_login@example.com',
        password: 'password123',
      }),
    });
    const body = (await res.json()) as LoginResponse;

    expect(res.status).toBe(200);
    expect(typeof body.data.token).toBe('string');
    expect(body.data.user.user_email).toBe('TEST_handler_login@example.com');
  });

  it('should return 401 with wrong password', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'TEST_handler_login@example.com',
        password: 'wrongpassword',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 401 for non-existent user', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'no_such_TEST@example.com',
        password: 'password123',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 400 with missing fields', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'TEST_handler_login@example.com' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 for unverified user', async () => {
    await authService.signup({
      first_name: 'TEST',
      last_name: 'LoginUnverified',
      email: 'TEST_handler_login_unverified@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    });

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'TEST_handler_login_unverified@example.com',
        password: 'password123',
      }),
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should return 200', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });
    expect(res.status).toBe(200);
  });

  it('should return a success message', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });
    const body = (await res.json()) as { data: { message: string } };
    expect(body.data.message).toContain('Logged out');
  });
});

describe('GET /api/auth/verify-email', () => {
  it('should return 200 with a valid token', async () => {
    const { token } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'VerifyHandler',
        email: 'TEST_handler_verify@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    const res = await app.request(`/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
    const body = (await res.json()) as {
      data: { message: string; user: User };
    };

    expect(res.status).toBe(200);
    expect(body.data.message).toContain('verified');
    expect(body.data.user.user_email).toBe('TEST_handler_verify@example.com');
  });

  it('should return 400 with an invalid token', async () => {
    const res = await app.request(
      '/api/auth/verify-email?token=invalid-token-xyz',
      { method: 'GET' },
    );
    expect(res.status).toBe(400);
  });

  it('should return 400 when token query param is missing', async () => {
    const res = await app.request('/api/auth/verify-email', { method: 'GET' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('should return 200 regardless of whether email exists', async () => {
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_TEST@example.com' }),
    });
    expect(res.status).toBe(200);
  });

  it('should return 200 for a valid registered and verified email', async () => {
    const { token: verifyToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'ForgotHandler',
        email: 'TEST_handler_forgot@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verifyToken);

    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'TEST_handler_forgot@example.com' }),
    });
    expect(res.status).toBe(200);
  });

  it('should return 400 with missing email field', async () => {
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('should return 400 with an invalid token', async () => {
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid-token-xyz',
        newPassword: 'newpassword123',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 200 with a valid reset token', async () => {
    const { token: verifyToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'ResetHandler',
        email: 'TEST_handler_reset@example.com',
        password: 'oldpassword123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verifyToken);

    const resetToken = assertDefined(
      await authService.forgotPassword('TEST_handler_reset@example.com'),
    );

    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'newpassword456',
      }),
    });
    const body = (await res.json()) as { data: { message: string } };

    expect(res.status).toBe(200);
    expect(body.data.message).toContain('reset');
  });

  it('should return 400 with missing required fields', async () => {
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'some-token' }),
    });
    expect(res.status).toBe(400);
  });
});
