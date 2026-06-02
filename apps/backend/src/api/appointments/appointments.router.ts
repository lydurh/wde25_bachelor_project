import { Hono } from 'hono';
import {
  listAppointments,
  getAppointmentById,
  deleteAppointmentById,
  createAppointment,
  updateAppointment,
  sendConfirmationEmail,
} from './appointments.handler';

export const appointmentsRoutes = new Hono();

appointmentsRoutes.get('/', listAppointments);
appointmentsRoutes.post('/send-confirmation-email', ...sendConfirmationEmail);
appointmentsRoutes.post('/', ...createAppointment);
appointmentsRoutes.get('/:id', getAppointmentById);
appointmentsRoutes.patch('/:id', ...updateAppointment);
appointmentsRoutes.delete('/:id', deleteAppointmentById);
