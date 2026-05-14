import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import {
  createAvailabilityInputSchema,
  updateAvailabilityInputSchema,
} from '@repo/shared';
import { availabilityService } from './availability.service';

const factory = createFactory();

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireAvailabilityId(id: string | undefined): string {
  if (!id || !UUID_REGEX.test(id)) {
    throw new HTTPException(400, { message: 'Invalid id parameter' });
  }
  return id;
}

export const listAvailability = async (c: Context) => {
  const data = await availabilityService.list();
  return c.json({ data });
};

export const getAvailability = async (c: Context) => {
  const id = requireAvailabilityId(c.req.param('id'));
  const data = await availabilityService.get(id);
  if (!data) {
    throw new HTTPException(404, { message: 'Availability not found' });
  }
  return c.json({ data });
};

export const createAvailability = factory.createHandlers(
  zValidator('json', createAvailabilityInputSchema, (result, c) => {
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
    const data = await availabilityService.post(input);
    if (data === null) {
      throw new HTTPException(500, {
        message: 'Availability was not returned after insert',
      });
    }
    return c.json({ data }, 201);
  },
);

export const updateAvailability = factory.createHandlers(
  zValidator('json', updateAvailabilityInputSchema, (result, c) => {
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
    const id = requireAvailabilityId(c.req.param('id'));
    const input = c.req.valid('json');
    const data = await availabilityService.patch(id, input);
    if (!data) {
      throw new HTTPException(404, { message: 'Availability not found' });
    }
    return c.json({ data }, 200);
  },
);

export const deleteAvailability = async (c: Context) => {
  const id = requireAvailabilityId(c.req.param('id'));
  const data = await availabilityService.delete(id);
  if (!data) {
    throw new HTTPException(404, { message: 'Availability not found' });
  }
  return c.json({ data }, 200);
};
