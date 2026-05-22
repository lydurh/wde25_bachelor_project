import { describe, it, expect, afterAll, beforeAll } from 'bun:test';
import { authService, getResetTokenForTest } from '../../api/auth/auth.service';
import { db, users, like } from '@repo/db';

const assertDefined = <T>(val: T | undefined | null): T => {
  expect(val).not.toBeNull();
  expect(val).toBeDefined();
  return val as T;
};

beforeAll(async () => {
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
});

afterAll(async () => {
  await db.delete(users).where(like(users.user_email, 'TEST_%'));
});

describe('authService.signup', () => {
  it('should create a new user and return user + verificationToken', async () => {
    const result = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'User',
        email: 'TEST_signup@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    expect(result.user.user_email).toBe('TEST_signup@example.com');
    expect(result.user.user_first_name).toBe('TEST');
    expect(typeof result.verificationToken).toBe('string');
    expect(result.verificationToken.length).toBeGreaterThan(0);
  });

  it('should generate a valid UUID for user_pk', async () => {
    const result = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'UUID',
        email: 'TEST_signup_uuid@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    expect(result.user.user_pk).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should throw 409 when email is already registered', async () => {
    await authService.signup({
      first_name: 'TEST',
      last_name: 'Duplicate',
      email: 'TEST_signup_dup@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    });

    expect(
      authService.signup({
        first_name: 'TEST',
        last_name: 'Duplicate',
        email: 'TEST_signup_dup@example.com',
        password: 'password456',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    ).rejects.toThrow('Email already registered');
  });

  it('should not expose user_password in the returned user object', async () => {
    const result = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'NoPassword',
        email: 'TEST_signup_nopwd@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    expect(
      (result.user as Record<string, unknown>)['user_password'],
    ).toBeUndefined();
  });

  it('should default user_role to client', async () => {
    const result = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'Role',
        email: 'TEST_signup_role@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    expect(result.user.user_role).toBe('client');
  });
});

describe('authService.login', () => {
  it('should return null when user does not exist', async () => {
    const result = await authService.login({
      email: 'nonexistent_TEST@example.com',
      password: 'password123',
    });
    expect(result).toBeNull();
  });

  it('should return null when password is incorrect', async () => {
    await authService.signup({
      first_name: 'TEST',
      last_name: 'Login',
      email: 'TEST_login_wrong_pwd@example.com',
      password: 'correctpassword',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    });

    const result = await authService.login({
      email: 'TEST_login_wrong_pwd@example.com',
      password: 'wrongpassword',
    });
    expect(result).toBeNull();
  });

  it('should return null for unverified user', async () => {
    await authService.signup({
      first_name: 'TEST',
      last_name: 'Unverified',
      email: 'TEST_login_unverified@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    });

    const result = await authService.login({
      email: 'TEST_login_unverified@example.com',
      password: 'password123',
    });
    expect(result).toBeNull();
  });

  it('should return user after email is verified', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'Verified',
        email: 'TEST_login_verified@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verificationToken);

    const result = assertDefined(
      await authService.login({
        email: 'TEST_login_verified@example.com',
        password: 'password123',
      }),
    );

    expect(result.user_email).toBe('TEST_login_verified@example.com');
  }, 15000);
});

describe('authService.logout', () => {
  it('should return true', () => {
    const result = authService.logout();
    expect(result).toBe(true);
  });
});

describe('authService.verifyEmail', () => {
  it('should verify a user and return the user', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'VerifyEmail',
        email: 'TEST_verify_email@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );

    const result = assertDefined(
      await authService.verifyEmail(verificationToken),
    );

    expect(result.user_email).toBe('TEST_verify_email@example.com');
  });

  it('should return null for an invalid token', async () => {
    const result = await authService.verifyEmail(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeNull();
  });

  it('should return null when token is used a second time', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'VerifyTwice',
        email: 'TEST_verify_twice@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verificationToken);

    const result = await authService.verifyEmail(verificationToken);
    expect(result).toBeNull();
  });
});

describe('authService.forgotPassword', () => {
  it('should return false for a non-existent email', async () => {
    const result = await authService.forgotPassword(
      'nonexistent_TEST@example.com',
    );
    expect(result).toBe(false);
  });

  it('should return false for an unverified user', async () => {
    await authService.signup({
      first_name: 'TEST',
      last_name: 'ForgotUnverified',
      email: 'TEST_forgot_unverified@example.com',
      password: 'password123',
      address: 'TEST Address 1',
      postal_code: '1234',
      city: 'Copenhagen',
    });

    const result = await authService.forgotPassword(
      'TEST_forgot_unverified@example.com',
    );
    expect(result).toBe(false);
  });

  it('should return true for a verified user', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'ForgotVerified',
        email: 'TEST_forgot_verified@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verificationToken);

    const sent = await authService.forgotPassword(
      'TEST_forgot_verified@example.com',
    );
    expect(sent).toBe(true);

    const resetToken = assertDefined(
      await getResetTokenForTest('TEST_forgot_verified@example.com'),
    );
    expect(typeof resetToken).toBe('string');
    expect(resetToken.length).toBeGreaterThan(0);
  }, 15000);
});

describe('authService.resetPassword', () => {
  it('should return false for an invalid token', async () => {
    const result = await authService.resetPassword(
      '00000000-0000-0000-0000-000000000000',
      'newpassword123',
    );
    expect(result).toBe(false);
  });

  it('should reset the password and allow login with new password', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'ResetPwd',
        email: 'TEST_reset_pwd@example.com',
        password: 'oldpassword123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verificationToken);

    await authService.forgotPassword('TEST_reset_pwd@example.com');

    const resetToken = assertDefined(
      await getResetTokenForTest('TEST_reset_pwd@example.com'),
    );

    const success = await authService.resetPassword(
      resetToken,
      'newpassword456',
    );
    expect(success).toBe(true);

    const user = await authService.login({
      email: 'TEST_reset_pwd@example.com',
      password: 'newpassword456',
    });
    expect(user).not.toBeNull();
  }, 15000);

  it('should invalidate the reset token after use', async () => {
    const { verificationToken } = assertDefined(
      await authService.signup({
        first_name: 'TEST',
        last_name: 'ResetOnce',
        email: 'TEST_reset_once@example.com',
        password: 'password123',
        address: 'TEST Address 1',
        postal_code: '1234',
        city: 'Copenhagen',
      }),
    );
    await authService.verifyEmail(verificationToken);

    await authService.forgotPassword('TEST_reset_once@example.com');

    const resetToken = assertDefined(
      await getResetTokenForTest('TEST_reset_once@example.com'),
    );

    await authService.resetPassword(resetToken, 'newpassword123');
    const second = await authService.resetPassword(
      resetToken,
      'anotherpassword',
    );
    expect(second).toBe(false);
  }, 15000);
});
