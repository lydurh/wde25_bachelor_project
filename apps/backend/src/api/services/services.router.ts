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
servicesRoutes.get('/:serviceId', getService);
servicesRoutes.post('/', createService);
servicesRoutes.patch('/:serviceId', updateService);
servicesRoutes.delete('/:serviceId', deleteService);

export { servicesRoutes };
