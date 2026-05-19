import { db, users, isNull, eq, and } from '@repo/db';
import type { UpdateUserInput, CreateUserInput } from '@repo/shared';
import { toPublicUser } from '@repo/shared';

export const usersService = {
  async list() {
    const rows = await db
      .select()
      .from(users)
      .where(isNull(users.user_deleted_at));
    return rows.map(toPublicUser);
  },

  async getById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.user_pk, id), isNull(users.user_deleted_at)))
      .limit(1);

    return user ? toPublicUser(user) : undefined;
  },

  async create(data: CreateUserInput) {
    const [user] = await db.insert(users).values(data).returning();
    return user ? toPublicUser(user) : undefined;
  },

  async update(id: string, data: UpdateUserInput) {
    const [user] = await db
      .update(users)
      .set({ ...data, user_updated_at: new Date() })
      .where(and(eq(users.user_pk, id), isNull(users.user_deleted_at)))
      .returning();
    return user ? toPublicUser(user) : undefined;
  },

  async remove(id: string) {
    const [user] = await db
      .update(users)
      .set({ user_deleted_at: new Date() })
      .where(and(eq(users.user_pk, id), isNull(users.user_deleted_at)))
      .returning();
    return user ? toPublicUser(user) : undefined;
  },
};
