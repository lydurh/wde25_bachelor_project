import { env } from '../lib/env';

type LatLng = { lat: number; lng: number };

type GeocodeResult = {
  types: string[];
  partial_match?: boolean;
  geometry: {
    location: LatLng;
    location_type: string;
  };
};

type GeocodeResponse = {
  status: string;
  results: GeocodeResult[];
};

/** Default fallback coordinates (Copenhagen centre) used in non-production. */
const FALLBACK_COORDS: LatLng = { lat: 55.6761, lng: 12.5683 };

export const geocoder = async (
  address: string,
  postalCode: string,
  city: string,
): Promise<LatLng> => {
  const fullAddress = `${address}, ${postalCode}, ${city}, Denmark`;
  const params = new URLSearchParams({
    address: fullAddress,
    key: env.GOOGLE_MAPS_API_KEY,
    region: 'dk',
    components: 'country:DK',
  });

  let data: GeocodeResponse;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    data = (await response.json()) as GeocodeResponse;
  } catch {
    if (env.NODE_ENV === 'production') {
      throw new Error(`Geocoding request failed for "${fullAddress}"`);
    }
    console.warn(
      `[geocoder] API request failed for "${fullAddress}", using fallback coordinates`,
    );
    return FALLBACK_COORDS;
  }

  if (data.status !== 'OK' || data.results.length === 0) {
    if (env.NODE_ENV === 'production') {
      throw new Error(`Geocoding failed for "${fullAddress}": ${data.status}`);
    }
    console.warn(
      `[geocoder] API returned ${data.status} for "${fullAddress}", using fallback coordinates`,
    );
    return FALLBACK_COORDS;
  }

  return data.results[0]?.geometry.location as LatLng;
};
