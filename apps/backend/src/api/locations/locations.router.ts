import { Hono } from 'hono';
import {
  listLocations,
  getAdminOrigin,
  getLocation,
  createLocation,
  createBookingLocation,
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
locationsRoutes.post('/from-address', authMiddleware, ...createBookingLocation);
locationsRoutes.get('/:id', getLocation);
locationsRoutes.post('/', authMiddleware, adminMiddleware, ...createLocation);

export { locationsRoutes };
