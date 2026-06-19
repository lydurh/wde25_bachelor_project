import { Hono } from 'hono';
import {
  listAppointments,
  getAppointmentById,
  deleteAppointmentById,
  createAppointment,
  updateAppointment,
  sendConfirmationEmail,
  listAppointmentsByUserId,
} from './appointments.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

export const appointmentsRoutes = new Hono();

// Every appointment route requires authentication. Applied here (not via a
// path-prefix `use` in the parent router) so the bare `/appointments` list
// route is covered too — a `/appointments/*` wildcard does not match it.
appointmentsRoutes.use('*', authMiddleware);

// Listing every appointment is admin-only; clients read their own via
// `/list/:id`. Without this any authenticated user could enumerate all bookings.
appointmentsRoutes.get('/', adminMiddleware, listAppointments);
appointmentsRoutes.get('/list/:id', listAppointmentsByUserId);
appointmentsRoutes.post('/send-confirmation-email', ...sendConfirmationEmail);
appointmentsRoutes.post('/', ...createAppointment);
appointmentsRoutes.get('/:id', getAppointmentById);
appointmentsRoutes.patch('/:id', ...updateAppointment);
appointmentsRoutes.delete('/:id', deleteAppointmentById);
