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

/** Public API shape — internal fields stripped. */
export type PublicLocation = {
  location_pk: string;
  location_address: string;
  location_postal_code: string | null;
  location_city: string;
  location_country: string | null;
};

/** Strip internal fields from a location row before returning to the client. */
export function toPublicLocation(row: Location): PublicLocation {
  return {
    location_pk: row.location_pk,
    location_address: row.location_address,
    location_postal_code: row.location_postal_code,
    location_city: row.location_city,
    location_country: row.location_country,
  };
}
