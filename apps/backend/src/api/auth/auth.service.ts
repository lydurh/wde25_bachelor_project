import type { InferSelectModel } from 'drizzle-orm';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { db, users } from '@repo/db';
import type { User } from '@repo/shared';

type UserRow = InferSelectModel<typeof users>;

const verificationTokens = new Map<string, string>();
const resetPasswordTokens = new Map<string, string>();

function userFromRow(row: UserRow): User {
  const name = [row.user_first_name, row.user_last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  return {
    id: row.user_pk,
    name,
    email: row.user_email,
  };
}

export const authService = {
  async signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ): Promise<{ user: User; token: string } | null> {
    const [existing] = await db
      .select({ pk: users.user_pk })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1);

    if (existing) {
      return null;
    }

    const [row] = await db
      .insert(users)
      .values({
        user_email: email,
        user_first_name: first_name,
        user_last_name: last_name || '',
        user_password: password,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    const token = crypto.randomUUID();
    verificationTokens.set(token, row.user_pk);

    return {
      user: userFromRow(row),
      token,
    };
  },

  async login(email: string, password: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, email),
          eq(users.user_password, password),
          isNotNull(users.user_verified_at),
          isNull(users.user_deleted_at),
        ),
      )
      .limit(1);

    return row ? userFromRow(row) : null;
  },

  logout(): boolean {
    return true;
  },

  async verifyEmail(token: string): Promise<User | null> {
    const userId = verificationTokens.get(token);

    if (!userId) {
      return null;
    }

    const [updated] = await db
      .update(users)
      .set({ user_verified_at: new Date() })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      verificationTokens.delete(token);
      return null;
    }

    verificationTokens.delete(token);

    return userFromRow(updated);
  },

  async forgotPassword(email: string): Promise<string | null> {
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
      return null;
    }

    const token = crypto.randomUUID();
    resetPasswordTokens.set(token, row.user_pk);

    return token;
  },

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = resetPasswordTokens.get(token);

    if (!userId) {
      return false;
    }

    const [updated] = await db
      .update(users)
      .set({
        user_password: newPassword,
        user_updated_at: new Date(),
      })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      resetPasswordTokens.delete(token);
      return false;
    }

    resetPasswordTokens.delete(token);

    return true;
  },
};
