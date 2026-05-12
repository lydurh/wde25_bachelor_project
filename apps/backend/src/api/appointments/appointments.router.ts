import { Hono } from 'hono';
import { listAppointments, getAppointmentById } from './appointments.handler';

const appointmentsRouter = new Hono();

appointmentsRouter.get('/', listAppointments);
appointmentsRouter.get('/:id', getAppointmentById);

export { appointmentsRouter };
