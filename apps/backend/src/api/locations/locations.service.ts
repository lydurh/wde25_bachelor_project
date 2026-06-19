import { db, locations, eq, isNull, and } from '@repo/db';
import { appliesLocationFee, type CreateLocationInput } from '@repo/shared';
import { computeRouteDistanceKm } from '../../utils/routes';
import { geocodeFormattedAddress } from '../../utils/geocoder';
import { usersService } from '../users/users.service';
import { businessSettingsService } from '../business-settings/business-settings.service';

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
    const [admin, settings] = await Promise.all([
      usersService.getAdminLocation(),
      businessSettingsService.get(),
    ]);

    const originAddress = admin.address.trim();
    const destination = destinationAddress.trim();
    const distanceKm =
      originAddress.toLowerCase() === destination.toLowerCase()
        ? 0 // Same address: skip Routes API (returns no route for identical origin/destination)
        : await computeRouteDistanceKm(originAddress, destination);

    return {
      distanceKm,
      appliesLocationFee: appliesLocationFee(
        distanceKm,
        settings.location_fee_threshold_km,
      ),
    };
  },
};
