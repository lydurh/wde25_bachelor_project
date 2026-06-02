import { db, locations, eq, isNull, and } from '@repo/db';
import { appliesLocationFee, type CreateLocationInput } from '@repo/shared';
import { computeRouteDistanceKm } from '../../utils/routes';
import { geocodeFormattedAddress } from '../../utils/geocoder';
import { usersService } from '../users/users.service';

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

  async createFromFormattedAddress(formattedAddress: string) {
    const parsed = await geocodeFormattedAddress(formattedAddress);
    return this.create(parsed);
  },

  async checkDistanceFee(destinationAddress: string) {
    const admin = await usersService.getAdminLocation();
    const distanceKm = await computeRouteDistanceKm(
      admin.address,
      destinationAddress,
    );

    return {
      distanceKm,
      appliesLocationFee: appliesLocationFee(distanceKm),
    };
  },
};
