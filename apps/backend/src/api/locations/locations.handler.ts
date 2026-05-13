import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { locationsService } from './locations.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listLocations = async (c: Context) => {
  const data = await locationsService.list();

  return c.json({ data });
};

export const getLocation = async (c: Context) => {
  const locationId = c.req.param('locationId');

  if (!locationId || !UUID_REGEX.test(locationId)) {
    throw new HTTPException(400, { message: 'Invalid locationId parameter' });
  }

  const location = await locationsService.getById(locationId);
  if (!location) {
    throw new HTTPException(404, { message: 'Location not found' });
  }

  return c.json({ data: location });
};
