export type Location = {
  location_pk: string;
  location_address: string;
  location_postal_code: string | null;
  location_city: string;
  location_country: string | null;
  location_latitude: string | null;
  location_longitude: string | null;
  location_created_at: Date;
  location_updated_at: Date | null;
  location_deleted_at: Date | null;
};

/** Public API shape — internal soft-delete marker stripped. */
export type PublicLocation = Omit<Location, 'location_deleted_at'>;

/** Strip internal fields from a location row before returning to the client. */
export function toPublicLocation(row: Location): PublicLocation {
  const { location_deleted_at: _location_deleted_at, ...rest } = row;
  return rest;
}
