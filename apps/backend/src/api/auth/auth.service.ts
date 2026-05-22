import { and, db, eq, isNotNull, isNull, users } from '@repo/db';
import type { LoginInput, SignupInput, User } from '@repo/shared';
import { toPublicUser } from '@repo/shared';
import { locationsService } from '../locations/locations.service';
import { HTTPException } from 'hono/http-exception';
import {
  getMailFrom,
  isMockEmailTransport,
  resolveMailRecipient,
  transporter,
} from '../../utils/mailer';
import { env } from '../../lib/env';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

type TokenEntry = { userId: string; expiresAt: number };

const verificationTokens = new Map<string, TokenEntry>();
const resetPasswordTokens = new Map<string, TokenEntry>();

const isTokenValid = (entry: TokenEntry | undefined): entry is TokenEntry => {
  if (!entry) return false;
  if (entry.expiresAt <= Date.now()) {
    return false;
  }
  return true;
};

const consumeToken = (
  map: Map<string, TokenEntry>,
  token: string,
): string | null => {
  const entry = map.get(token);
  if (!isTokenValid(entry)) {
    map.delete(token);
    return null;
  }
  map.delete(token);
  return entry.userId;
};

/** Safe snippet for HTML email bodies (matches shared escapeHtml). */
const escapeEmailDisplay = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const authService = {
  list() {
    return db.select().from(users).where(isNull(users.user_deleted_at));
  },

  async getById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.user_pk, id))
      .limit(1);

    return user;
  },

  async signup(
    input: SignupInput,
  ): Promise<{ user: User; verificationToken: string } | null> {
    const {
      first_name,
      last_name,
      email,
      password,
      address,
      postal_code,
      city,
    } = input;
    const [existing] = await db
      .select({ pk: users.user_pk })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1);

    if (existing) {
      throw new HTTPException(409, {
        message: 'Email already registered',
      });
    }

    const location = await locationsService.create({
      location_address: address,
      location_postal_code: postal_code,
      location_city: city,
      location_country: 'Denmark',
    });

    if (!location) {
      throw new Error('Location insert failed');
    }

    const hashedPassword = await Bun.password.hash(password);

    const [row] = await db
      .insert(users)
      .values({
        user_email: email,
        user_first_name: first_name,
        user_last_name: last_name || '',
        user_password: hashedPassword,
        user_location_fk: location.location_pk,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    const verificationToken = crypto.randomUUID();

    verificationTokens.set(verificationToken, {
      userId: row.user_pk,
      expiresAt: Date.now() + VERIFICATION_TTL_MS,
    });

    const verificationLink = `${env.PUBLIC_API_URL}/api/auth/verify-email?token=${verificationToken}`;
    const safeEmail = escapeEmailDisplay(email);
    const mailTo = resolveMailRecipient(email);

    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: mailTo,
        subject: 'Verify your account',
        html: `
<h2>Hello ${safeEmail}</h2>
<p>Thanks for signing up! Please verify your account by clicking the link below:</p>
<p><a href="${verificationLink}">Verify Account</a></p>
        `,
      });
      if (isMockEmailTransport) {
        console.warn(
          `[email] Set EMAIL_USER and EMAIL_PASS in .env to receive mail. Verification link:\n  ${verificationLink}`,
        );
      }
    } catch (err) {
      console.warn('Failed to send verification email:', err);
      console.warn(
        `[email] Verification link for ${email}:\n  ${verificationLink}`,
      );
    }

    return {
      user: toPublicUser(row),
      verificationToken,
    };
  },

  async login(input: LoginInput): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, input.email),
          isNotNull(users.user_verified_at),
          isNull(users.user_deleted_at),
        ),
      )
      .limit(1);

    if (!row) return null;

    const isValid = await Bun.password.verify(
      input.password,
      row.user_password,
    );
    if (!isValid) return null;

    return toPublicUser(row);
  },

  logout(): boolean {
    return true;
  },

  async verifyEmail(token: string): Promise<User | null> {
    const userId = consumeToken(verificationTokens, token);

    if (!userId) {
      return null;
    }

    const [updated] = await db
      .update(users)
      .set({ user_verified_at: new Date() })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      return null;
    }

    return toPublicUser(updated);
  },

  async forgotPassword(email: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, email),
          isNotNull(users.user_verified_at),
          isNull(users.user_deleted_at),
        ),
      )
      .limit(1);

    if (!row) {
      return false;
    }

    const token = crypto.randomUUID();
    resetPasswordTokens.set(token, {
      userId: row.user_pk,
      expiresAt: Date.now() + RESET_TTL_MS,
    });

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const safeEmail = escapeEmailDisplay(email);
    const mailTo = resolveMailRecipient(email);

    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: mailTo,
        subject: 'Reset your password',
        html: `
<h2>Hello ${safeEmail}</h2>
<p>Click the link below to reset your password.</p>
<p><a href="${resetLink}">Reset Password</a></p>
        `,
      });
      if (isMockEmailTransport) {
        console.warn(
          `[email] Set EMAIL_USER and EMAIL_PASS in .env to receive mail. Reset link:\n  ${resetLink}`,
        );
      }
    } catch (err) {
      console.warn('Failed to send reset password email:', err);
      console.warn(`[email] Reset link for ${email}:\n  ${resetLink}`);
    }

    return true;
  },

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = consumeToken(resetPasswordTokens, token);

    if (!userId) {
      return false;
    }

    const hashedPassword = await Bun.password.hash(newPassword);

    const [updated] = await db
      .update(users)
      .set({
        user_password: hashedPassword,
        user_updated_at: new Date(),
      })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      return false;
    }

    return true;
  },
};

/** @internal Test helper — retrieves active reset token for a user id. */
export const findResetTokenByUserId = (userId: string): string | null => {
  for (const [token, entry] of resetPasswordTokens) {
    if (isTokenValid(entry) && entry.userId === userId) {
      return token;
    }
  }
  return null;
};

/** @internal Test helper — retrieves active reset token by user email. */
export const getResetTokenForTest = async (
  email: string,
): Promise<string | null> => {
  const [row] = await db
    .select({ pk: users.user_pk })
    .from(users)
    .where(eq(users.user_email, email))
    .limit(1);

  if (!row) return null;
  return findResetTokenByUserId(row.pk);
};
