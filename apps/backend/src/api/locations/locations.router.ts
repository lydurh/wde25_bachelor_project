import { Hono } from 'hono';
import {
  listLocations,
  getAdminOrigin,
  getLocation,
  createLocation,
  checkLocationDistance,
} from './locations.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

const locationsRoutes = new Hono();

locationsRoutes.get('/', listLocations);
locationsRoutes.get('/admin-origin', getAdminOrigin);
locationsRoutes.post(
  '/distance-check',
  authMiddleware,
  ...checkLocationDistance,
);
locationsRoutes.get('/:id', getLocation);
locationsRoutes.post('/', authMiddleware, adminMiddleware, ...createLocation);

export { locationsRoutes };
