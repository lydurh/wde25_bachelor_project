import { Hono } from 'hono';
import { listAppointments } from './appointments.handler';

const appointmentsRouter = new Hono();

appointmentsRouter.get('/', listAppointments);

export { appointmentsRouter };