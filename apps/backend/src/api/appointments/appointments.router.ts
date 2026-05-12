import { Hono } from 'hono';
import {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
} from './appointments.handler';

export const appointmentsRouter = new Hono();

appointmentsRouter.get('/', listAppointments);
appointmentsRouter.get('/:id', getAppointmentById);
appointmentsRouter.post('/', ...createAppointment);
appointmentsRouter.patch('/:id', ...updateAppointment);
