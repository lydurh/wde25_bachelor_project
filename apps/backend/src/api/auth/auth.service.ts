import { and, db, eq, isNotNull, isNull, users } from '@repo/db';
import type { LoginInput, SignupInput, SignupResult, User } from '@repo/shared';

const verificationTokens = new Map<string, string>();
const resetPasswordTokens = new Map<string, string>();

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

  async signup(input: SignupInput): Promise<SignupResult | null> {
    const [existing] = await db
      .select({ pk: users.user_pk })
      .from(users)
      .where(eq(users.user_email, input.email))
      .limit(1);

    if (existing) {
      return null;
    }

    const hashedPassword = await Bun.password.hash(input.password);

    const [row] = await db
      .insert(users)
      .values({
        user_email: input.email,
        user_first_name: input.first_name,
        user_last_name: input.last_name ?? '',
        user_password: hashedPassword,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    const token = crypto.randomUUID();
    verificationTokens.set(token, row.user_pk);

    return {
      user: row,
      token,
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

    return row;
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

    return updated;
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
      resetPasswordTokens.delete(token);
      return false;
    }

    resetPasswordTokens.delete(token);

    return true;
  },
};
