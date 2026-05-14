import type { Context } from 'hono';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import {
  createAvailabilityInputSchema,
  updateAvailabilityInputSchema,
} from '@repo/shared';
import { availabilityService } from './availability.service';

const factory = createFactory();

export const listAvailability = async (c: Context) => {
  const data = await availabilityService.list();
  return c.json({ data });
};

export const getAvailability = async (c: Context) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Availability ID is required' }, 400);
  }
  const data = await availabilityService.get(id);
  if (!data) {
    return c.json({ error: 'Availability not found' }, 404);
  }
  return c.json({ data });
};

export const createAvailability = factory.createHandlers(
  zValidator('json', createAvailabilityInputSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: 'Invalid Input', issues: result.error.issues },
        400,
      );
    }
    return undefined;
  }),
  async (c) => {
    const input = c.req.valid('json');
    const data = await availabilityService.post(input);
    return c.json({ data }, 201);
  },
);

export const updateAvailability = factory.createHandlers(
  zValidator('json', updateAvailabilityInputSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: 'Invalid Input', issues: result.error.issues },
        400,
      );
    }
    return undefined;
  }),
  async (c) => {
    const id = c.req.param('id');
    if (!id) {
      return c.json({ error: 'Availability ID is required' }, 400);
    }
    const input = c.req.valid('json');
    const data = await availabilityService.patch(id, input);
    if (!data) {
      return c.json({ error: 'Availability not found' }, 404);
    }
    return c.json({ data }, 200);
  },
);

export const deleteAvailability = async (c: Context) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Availability ID is required' }, 400);
  }
  const data = await availabilityService.delete(id);
  if (!data) {
    return c.json({ error: 'Availability not found' }, 404);
  }
  return c.json({ data }, 200);
};
