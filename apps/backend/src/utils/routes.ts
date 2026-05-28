import { env } from '../lib/env';

type RoutesDurationResponse = {
  routes: {
    duration: string;
  }[];
};

type RoutesDistanceResponse = {
  routes: {
    distanceMeters: number;
  }[];
};

export const computeDriveTime = async (
  originAddress: string,
  destinationAddress: string,
): Promise<number> => {
  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration',
      },
      body: JSON.stringify({
        origin: { address: originAddress },
        destination: { address: destinationAddress },
        travelMode: 'DRIVE',
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google Routes API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as RoutesDurationResponse;

  const durationStr = data.routes[0]?.duration;
  if (!durationStr) {
    throw new Error(
      `No route found from "${originAddress}" to "${destinationAddress}"`,
    );
  }

  const seconds = Number.parseInt(durationStr.replace('s', ''), 10);
  return Math.ceil(seconds / 60);
};

export const computeRouteDistanceKm = async (
  originAddress: string,
  destinationAddress: string,
): Promise<number> => {
  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: { address: originAddress },
        destination: { address: destinationAddress },
        travelMode: 'DRIVE',
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google Routes API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as RoutesDistanceResponse;
  const distanceMeters = data.routes[0]?.distanceMeters;
  if (distanceMeters == null) {
    throw new Error(
      `No route found from "${originAddress}" to "${destinationAddress}"`,
    );
  }

  return distanceMeters / 1000;
};

export const computeDriveTimeSage = async (
  originAddress: string,
  destinationAddress: string,
  fallbackMinutes = 999,
): Promise<number> => {
  try {
    return await computeDriveTime(originAddress, destinationAddress);
  } catch {
    return fallbackMinutes;
  }
};
