import { db, users, locations, isNull, eq, and, ilike, or } from '@repo/db';
import type { UpdateUserInput, CreateUserInput } from '@repo/shared';
import { formatLocationAddress, toPublicUser } from '@repo/shared';

export const usersService = {
  async list() {
    const rows = await db
      .select()
      .from(users)
      .where(isNull(users.user_deleted_at));
    return rows.map(toPublicUser);
  },

  async listByEmail(email: string, limit = 10) {
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.user_email, email), isNull(users.user_deleted_at)))
      .limit(limit);
    return rows.map(toPublicUser);
  },

  async listByName(nameQuery: string, limit = 20) {
    const trimmed = nameQuery.trim();
    if (!trimmed) {
      return [];
    }

    const terms = trimmed.split(/\s+/).filter(Boolean);
    const termConditions = terms.map((term) => {
      const pattern = `%${term}%`;
      return or(
        ilike(users.user_first_name, pattern),
        ilike(users.user_last_name, pattern),
      );
    });

    const rows = await db
      .select()
      .from(users)
      .where(and(isNull(users.user_deleted_at), ...termConditions))
      .limit(limit);

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

  async getAdminLocation(): Promise<{ address: string }> {
    const [row] = await db
      .select({
        location_address: locations.location_address,
        location_postal_code: locations.location_postal_code,
        location_city: locations.location_city,
      })
      .from(users)
      .innerJoin(locations, eq(users.user_location_fk, locations.location_pk))
      .where(
        and(
          eq(users.user_role, 'admin'),
          isNull(users.user_deleted_at),
          isNull(locations.location_deleted_at),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error('No admin location found');
    }

    return {
      address: formatLocationAddress({
        location_address: row.location_address,
        location_postal_code: row.location_postal_code,
        location_city: row.location_city,
      }),
    };
  },
};
