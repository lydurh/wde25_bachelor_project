import { Hono } from 'hono';
import {
  listLocations,
  getLocation,
  createLocation,
} from './locations.handler';

const locationsRoutes = new Hono();

locationsRoutes.get('/', listLocations);
locationsRoutes.get('/:id', getLocation);
locationsRoutes.post('/', ...createLocation);

export { locationsRoutes };
