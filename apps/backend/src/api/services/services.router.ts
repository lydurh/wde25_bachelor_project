import { Hono } from 'hono';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from './services.handler';

const servicesRoutes = new Hono();

servicesRoutes.get('/', listServices);
servicesRoutes.get('/:id', getService);
servicesRoutes.post('/', createService);
servicesRoutes.patch('/:id', updateService);
servicesRoutes.delete('/:id', deleteService);

export { servicesRoutes };
