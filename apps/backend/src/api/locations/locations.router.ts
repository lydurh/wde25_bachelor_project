import { Hono } from 'hono';
import { listLocations, getLocation } from './locations.handler';

const locationsRoutes = new Hono();

locationsRoutes.get('/', listLocations);
locationsRoutes.get('/:locationId', getLocation);

export { locationsRoutes };
