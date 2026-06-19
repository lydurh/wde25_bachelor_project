import { BOOKING_MAX_DISTANCE_KM } from './constants';

export type LocationAddressParts = {
  location_address: string;
  location_postal_code?: string | null;
  location_city: string;
};

export function formatLocationAddress(parts: LocationAddressParts): string {
  const cityLine = [parts.location_postal_code, parts.location_city]
    .filter(Boolean)
    .join(' ');

  return cityLine
    ? `${parts.location_address}, ${cityLine}`
    : parts.location_address;
}

export function appliesLocationFee(
  distanceKm: number,
  thresholdKm: number = BOOKING_MAX_DISTANCE_KM,
): boolean {
  return distanceKm > thresholdKm;
}
