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
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
  );

  const data = (await response.json()) as GeocodeResponse;

  if (data.status !== 'OK' || data.results.length === 0) {
    throw new Error(`Geocoding failed for "${fullAddress}": ${data.status}`);
  }

  return data.results[0]?.geometry.location as LatLng;
};
