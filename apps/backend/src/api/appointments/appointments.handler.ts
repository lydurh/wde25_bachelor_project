import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { appointmentsService } from './appointments.service';
import {
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  uuidSchema,
} from '@repo/shared';

const factory = createFactory();

function requireAppointmentId(id: string | undefined): string {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new HTTPException(400, { message: 'Invalid id parameter' });
  }
  return id;
}

export const listAppointments = async (c: Context) => {
  const data = await appointmentsService.list();

  return c.json({ data });
};

export const getAppointmentById = async (c: Context) => {
  const id = requireAppointmentId(c.req.param('id'));
  const appointment = await appointmentsService.get(id);

  if (!appointment) {
    throw new HTTPException(404, { message: 'Appointment not found' });
  }

  return c.json({ data: appointment }, 200);
};

export const deleteAppointmentById = async (c: Context) => {
  const id = requireAppointmentId(c.req.param('id'));
  const deletedAppointment = await appointmentsService.delete(id);

  if (!deletedAppointment) {
    throw new HTTPException(404, { message: 'Appointment not found' });
  }

  return c.json({ data: deletedAppointment }, 200);
};

// `createHandlers` threads the validator's input/output types through the chain,
// so `c.req.valid('json')` is typed as `CreateAppointmentInput` without a manual
// `Context<...>` alias. Spread the tuple into the router.
export const createAppointment = factory.createHandlers(
  zValidator('json', createAppointmentInputSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');
    try {
      const data = await appointmentsService.post(input);
      if (data === null) {
        throw new HTTPException(500, {
          message: 'Appointment was not returned after insert',
        });
      }
      return c.json({ data }, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes('total price')) {
        throw new HTTPException(400, { message: error.message });
      }
      if (
        error instanceof Error &&
        error.message.startsWith('Unknown service')
      ) {
        throw new HTTPException(400, { message: error.message });
      }
      throw error;
    }
  },
);

export const updateAppointment = factory.createHandlers(
  zValidator('json', updateAppointmentInputSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        res: c.json(
          { error: 'Invalid input', issues: result.error.issues },
          400,
        ),
      });
    }
    return undefined;
  }),
  async (c) => {
    const id = requireAppointmentId(c.req.param('id'));

    const input = c.req.valid('json');
    const updatedAppointment = await appointmentsService.patch(id, input);

    if (!updatedAppointment) {
      throw new HTTPException(404, { message: 'Appointment not found' });
    }

    return c.json({ data: updatedAppointment }, 200);
  },
);
