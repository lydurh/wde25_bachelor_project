import { Hono } from 'hono';
import {
  listLocations,
  getLocation,
  createLocation,
} from './locations.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

const locationsRoutes = new Hono();

locationsRoutes.get('/', listLocations);
locationsRoutes.get('/:id', getLocation);
locationsRoutes.post('/', authMiddleware, adminMiddleware, ...createLocation);

export { locationsRoutes };
