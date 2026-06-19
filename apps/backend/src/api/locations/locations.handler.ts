import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import {
  createLocationSchema,
  locationDistanceCheckInputSchema,
  bookingLocationFromAddressInputSchema,
  type AdminOrigin,
} from '@repo/shared';
import { requireUuidParam } from '../../lib/params';
import { usersService } from '../users/users.service';
import { locationsService } from './locations.service';

const factory = createFactory();

export const listLocations = async (c: Context) => {
  const data = await locationsService.list();

  return c.json({ data });
};

export const getAdminOrigin = async (c: Context) => {
  try {
    const data: AdminOrigin = await usersService.getAdminLocation();
    return c.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'No admin location found') {
      throw new HTTPException(503, { message: error.message });
    }
    if (
      error instanceof Error &&
      error.message === 'Admin location is missing coordinates'
    ) {
      throw new HTTPException(503, { message: error.message });
    }
    throw error;
  }
};

export const getLocation = async (c: Context) => {
  const id = requireUuidParam(c.req.param('id'));
  const location = await locationsService.getById(id);

  if (!location) {
    throw new HTTPException(404, { message: 'Location not found' });
  }

  return c.json({ data: location });
};

export const checkLocationDistance = factory.createHandlers(
  zValidator('json', locationDistanceCheckInputSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const { destinationAddress } = c.req.valid('json');

    try {
      const data = await locationsService.checkDistanceFee(destinationAddress);
      return c.json({ data });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'No admin location found' ||
          error.message === 'Admin location is missing coordinates')
      ) {
        throw new HTTPException(503, { message: error.message });
      }
      if (error instanceof Error && error.message.includes('Google Routes')) {
        throw new HTTPException(502, { message: 'Distance lookup failed' });
      }
      throw error;
    }
  },
);

export const createLocation = factory.createHandlers(
  zValidator('json', createLocationSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');
    const location = await locationsService.create(input);

    return c.json({ data: location }, 201);
  },
);

export const createBookingLocation = factory.createHandlers(
  zValidator('json', bookingLocationFromAddressInputSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const { formattedAddress } = c.req.valid('json');

    try {
      const location =
        await locationsService.createFromFormattedAddress(formattedAddress);
      return c.json({ data: location }, 201);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Geocoding')) {
        throw new HTTPException(400, { message: error.message });
      }
      throw error;
    }
  },
);
