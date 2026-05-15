import { db, users, isNull, eq, and } from '@repo/db';
import type { UpdateUserInput, CreateUserInput } from '@repo/shared';

export const usersService = {
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

  async create(data: CreateUserInput) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async update(id: string, data: UpdateUserInput) {
    const [user] = await db
      .update(users)
      .set({ ...data, user_updated_at: new Date() })
      .where(and(eq(users.user_pk, id), isNull(users.user_deleted_at)))
      .returning();
    return user;
  },

  async remove(id: string) {
    const [user] = await db
      .update(users)
      .set({ user_deleted_at: new Date() })
      .where(and(eq(users.user_pk, id), isNull(users.user_deleted_at)))
      .returning();
    return user;
  },
};
