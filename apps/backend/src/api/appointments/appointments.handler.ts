import type { Context } from 'hono';
import { appointmentsService } from './appointments.service';

export const listAppointments = (c: Context) => {
  const appointments = appointmentsService.list();

  return c.json({ data: appointments });
};