import { db, locations, eq } from '@repo/db';

export const locationsService = {
  list() {
    return db.select().from(locations);
  },

  async getById(id: string) {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.location_pk, id))
      .limit(1);

    return location;
  },
};
