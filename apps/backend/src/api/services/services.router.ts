import { Hono } from 'hono';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from './services.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

const servicesRoutes = new Hono();

servicesRoutes.get('/', listServices);
servicesRoutes.get('/:id', getService);
servicesRoutes.post('/', authMiddleware, adminMiddleware, ...createService);
servicesRoutes.patch('/:id', authMiddleware, adminMiddleware, ...updateService);
servicesRoutes.delete('/:id', authMiddleware, adminMiddleware, deleteService);

export { servicesRoutes };
