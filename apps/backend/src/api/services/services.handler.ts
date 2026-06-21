import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { createServiceSchema, updateServiceSchema } from '@repo/shared';
import { requireUuidParam } from '../../lib/params';
import { servicesService } from './services.service';

const factory = createFactory();

export const listServices = async (c: Context) => {
  const data = await servicesService.list();

  return c.json({ data });
};

export const getService = async (c: Context) => {
  const id = requireUuidParam(c.req.param('id'));
  const service = await servicesService.getById(id);

  if (!service) {
    throw new HTTPException(404, { message: 'Service not found' });
  }

  return c.json({ data: service });
};

export const createService = factory.createHandlers(
  zValidator('json', createServiceSchema, (result, c) => {
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
    const service = await servicesService.create(input);

    return c.json({ data: service }, 201);
  },
);

export const updateService = factory.createHandlers(
  zValidator('json', updateServiceSchema, (result, c) => {
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
    const id = requireUuidParam(c.req.param('id'));
    const input = c.req.valid('json');
    const service = await servicesService.update(id, input);

    if (!service) {
      throw new HTTPException(404, { message: 'Service not found' });
    }

    return c.json({ data: service });
  },
);

export const deleteService = async (c: Context) => {
  const id = requireUuidParam(c.req.param('id'));
  const service = await servicesService.remove(id);

  if (!service) {
    throw new HTTPException(404, { message: 'Service not found' });
  }

  return c.json({ data: service }, 200);
};
