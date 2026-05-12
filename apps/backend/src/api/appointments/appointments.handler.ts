import type { Context } from 'hono';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { appointmentsService } from './appointments.service';
import {
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
} from '@repo/shared';

const factory = createFactory();

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

// `createHandlers` threads the validator's input/output types through the chain,
// so `c.req.valid('json')` is typed as `CreateAppointmentInput` without a manual
// `Context<...>` alias. Spread the tuple into the router.
export const createAppointment = factory.createHandlers(
  zValidator('json', createAppointmentInputSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: 'Invalid input', issues: result.error.issues },
        400,
      );
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');
    const newAppointment = await appointmentsService.post(input);
    return c.json({ data: newAppointment }, 201);
  },
);

export const updateAppointment = factory.createHandlers(
  zValidator('json', updateAppointmentInputSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: 'Invalid input', issues: result.error.issues },
        400,
      );
    }
    return undefined;
  }),
  async (c) => {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Appointment ID is required' }, 400);
    }

    const input = c.req.valid('json');
    const updatedAppointment = await appointmentsService.patch(id, input);

    if (!updatedAppointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    return c.json({ data: updatedAppointment }, 200);
  },
);
