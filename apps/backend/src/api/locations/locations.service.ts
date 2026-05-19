import { db, locations, eq, isNull, and } from '@repo/db';
import type { CreateLocationInput } from '@repo/shared';

export const locationsService = {
  list() {
    return db
      .select()
      .from(locations)
      .where(isNull(locations.location_deleted_at));
  },

  async getById(id: string) {
    const [location] = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.location_pk, id),
          isNull(locations.location_deleted_at),
        ),
      )
      .limit(1);

    return location;
  },

  async create(data: CreateLocationInput) {
    const [location] = await db.insert(locations).values(data).returning();

    return location;
  },
};
