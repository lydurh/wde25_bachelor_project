import { Hono } from 'hono';
import {
  listAppointments,
  getAppointmentById,
  deleteAppointmentById,
  createAppointment,
  updateAppointment,
} from './appointments.handler';

export const appointmentsRouter = new Hono();

appointmentsRouter.get('/', listAppointments);
appointmentsRouter.get('/:id', getAppointmentById);
appointmentsRouter.delete('/:id', deleteAppointmentById);
appointmentsRouter.post('/', ...createAppointment);
appointmentsRouter.patch('/:id', ...updateAppointment);
