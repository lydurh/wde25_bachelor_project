import { env } from '../lib/env';

type LatLng = { lat: number; lng: number };

type GeocodeResult = {
  formatted_address?: string;
  address_components?: { long_name: string; types: string[] }[];
  geometry: { location: LatLng };
};

const FALLBACK: LatLng = { lat: 55.6761, lng: 12.5683 };

function findComponent(
  components: GeocodeResult['address_components'],
  type: string,
): string | null {
  return components?.find((c) => c.types.includes(type))?.long_name ?? null;
}

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    address,
    key: env.GOOGLE_MAPS_API_KEY,
    region: 'dk',
    components: 'country:DK',
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    const data = (await response.json()) as {
      status: string;
      results: GeocodeResult[];
    };

    if (data.status === 'OK' && data.results[0]) {
      return data.results[0];
    }
  } catch {
    // fall through to fallback handling below
  }

  if (env.NODE_ENV === 'production') {
    throw new Error(`Geocoding failed for "${address}"`);
  }

  console.warn(`[geocoder] Using fallback coordinates for "${address}"`);
  return null;
}

export async function geocoder(
  address: string,
  postalCode: string,
  city: string,
): Promise<LatLng> {
  const result = await geocodeAddress(
    `${address}, ${postalCode}, ${city}, Denmark`,
  );
  return result?.geometry.location ?? FALLBACK;
}

export async function geocodeFormattedAddress(formattedAddress: string) {
  const result = await geocodeAddress(formattedAddress);
  const { lat, lng } = result?.geometry.location ?? FALLBACK;

  return {
    location_address: result?.formatted_address ?? formattedAddress,
    location_postal_code: findComponent(
      result?.address_components,
      'postal_code',
    ),
    location_city:
      findComponent(result?.address_components, 'locality') ??
      findComponent(result?.address_components, 'postal_town') ??
      'Denmark',
    location_country:
      findComponent(result?.address_components, 'country') ?? 'Denmark',
    location_latitude: lat.toString(),
    location_longitude: lng.toString(),
  };
}
