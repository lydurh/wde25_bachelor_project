import { Hono } from 'hono';

import {
  listAvailability,
  getAvailability,
  deleteAvailability,
  createAvailability,
  updateAvailability,
} from './availability.handler';

export const availabilityRouter = new Hono();

availabilityRouter.get('/', listAvailability);
availabilityRouter.get('/:id', getAvailability);
availabilityRouter.post('/', ...createAvailability);
availabilityRouter.patch('/:id', ...updateAvailability);
availabilityRouter.delete('/:id', deleteAvailability);
