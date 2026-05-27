import {
  and,
  availability,
  db,
  eq,
  type InferSelectModel,
  isNull,
} from '@repo/db';
import {
  type Availability,
  type CreateAvailabilityInput,
  parseAvailability,
  type UpdateAvailabilityInput,
} from '@repo/shared';

type AvailabilityRow = InferSelectModel<typeof availability>;

function availabilityFromRow(row: AvailabilityRow): Availability {
  return parseAvailability({
    availability_pk: row.availability_pk,
    availability_date: row.availability_date,
    availability_start_time: row.availability_start_time,
    availability_end_time: row.availability_end_time,
    availability_created_at: row.availability_created_at.toISOString(),
    availability_updated_at: row.availability_updated_at?.toISOString() ?? null,
    availability_deleted_at: row.availability_deleted_at?.toISOString() ?? null,
  });
}

const notDeleted = isNull(availability.availability_deleted_at);

export const availabilityService = {
  async list() {
    const rows = await db.select().from(availability).where(notDeleted);
    return rows.map(availabilityFromRow);
  },

  async get(id: string) {
    const [row] = await db
      .select()
      .from(availability)
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .limit(1);
    return row ? availabilityFromRow(row) : undefined;
  },

  async delete(id: string) {
    if (!id) {
      return undefined;
    }
    const [row] = await db
      .update(availability)
      .set({ availability_deleted_at: new Date() })
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .returning();
    return row ? availabilityFromRow(row) : undefined;
  },

  async post(input: CreateAvailabilityInput) {
    const [row] = await db
      .insert(availability)
      .values({
        availability_date: input.availability_date,
        availability_start_time: input.availability_start_time,
        availability_end_time: input.availability_end_time,
      })
      .returning();

    return row ? availabilityFromRow(row) : null;
  },

  async patch(id: string, input: UpdateAvailabilityInput) {
    const [row] = await db
      .update(availability)
      .set({
        ...input,
        availability_updated_at: new Date(),
      })
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .returning();

    return row ? availabilityFromRow(row) : undefined;
  },
};
