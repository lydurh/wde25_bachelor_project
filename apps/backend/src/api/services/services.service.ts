import { db, services, eq, isNull, and } from '@repo/db';
import {
  type CreateServiceInput,
  type UpdateServiceInput,
  type PublicService,
  toPublicService,
} from '@repo/shared';

export const servicesService = {
  async list() {
    const rows = await db
      .select()
      .from(services)
      .where(isNull(services.service_deleted_at));

    return rows.map(toPublicService);
  },

  async getById(id: string) {
    const [service] = await db
      .select()
      .from(services)
      .where(
        and(eq(services.service_pk, id), isNull(services.service_deleted_at)),
      )
      .limit(1);

    return service ? toPublicService(service) : undefined;
  },

  async create(data: CreateServiceInput) {
    const [service] = await db.insert(services).values(data).returning();

    return service ? toPublicService(service) : undefined;
  },

  async update(id: string, data: UpdateServiceInput) {
    const [service] = await db
      .update(services)
      .set({
        ...data,
        service_updated_at: new Date(),
      })
      .where(
        and(eq(services.service_pk, id), isNull(services.service_deleted_at)),
      )
      .returning();

    return service ? toPublicService(service) : undefined;
  },

  async remove(id: string): Promise<PublicService | undefined> {
    const [service] = await db
      .update(services)
      .set({ service_deleted_at: new Date() })
      .where(
        and(eq(services.service_pk, id), isNull(services.service_deleted_at)),
      )
      .returning();

    return service ? toPublicService(service) : undefined;
  },
};
