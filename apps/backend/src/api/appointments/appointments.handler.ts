import type { Context } from 'hono';
import { appointmentsService } from './appointments.service';

export const listAppointments = (c: Context) => {
  const appointments = appointmentsService.list();

  return c.json({ data: appointments });
};

export const getAppointmentById = async (c: Context) => {
  const id = c.req.param('id');

  if (!id) {
    return c.json({ error: 'Appointment ID is required' }, 400);
  }
  const appointment = await appointmentsService.get(id);

  if (!appointment) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  return c.json({ data: appointment }, 200);
};
