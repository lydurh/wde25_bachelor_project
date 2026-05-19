import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../../middleware';

import {
  listAvailability,
  getAvailability,
  deleteAvailability,
  createAvailability,
  updateAvailability,
} from './availability.handler';

export const availabilityRoutes = new Hono();

availabilityRoutes.get('/', listAvailability);
availabilityRoutes.get('/:id', getAvailability);
availabilityRoutes.post(
  '/',
  authMiddleware,
  adminMiddleware,
  ...createAvailability,
);
availabilityRoutes.patch(
  '/:id',
  authMiddleware,
  adminMiddleware,
  ...updateAvailability,
);
availabilityRoutes.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteAvailability,
);
