import { Hono } from 'hono';
import {
  listAppointments,
  getAppointmentById,
  deleteAppointmentById,
  createAppointment,
  updateAppointment,
} from './appointments.handler';

export const appointmentsRoutes = new Hono();

appointmentsRoutes.get('/', listAppointments);
appointmentsRoutes.get('/:id', getAppointmentById);
appointmentsRoutes.delete('/:id', deleteAppointmentById);
appointmentsRoutes.post('/', ...createAppointment);
appointmentsRoutes.patch('/:id', ...updateAppointment);
