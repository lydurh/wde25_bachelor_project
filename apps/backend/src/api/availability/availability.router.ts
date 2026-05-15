import { Hono } from 'hono';

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
availabilityRoutes.post('/', ...createAvailability);
availabilityRoutes.patch('/:id', ...updateAvailability);
availabilityRoutes.delete('/:id', deleteAvailability);
