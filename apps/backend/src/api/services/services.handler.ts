import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { servicesService } from './services.service';
import { createServiceSchema, updateServiceSchema } from '@repo/shared';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listServices = async (c: Context) => {
  const data = await servicesService.list();

  return c.json({ data });
};

export const getService = async (c: Context) => {
  const id = c.req.param('id');

  if (!id || !UUID_REGEX.test(id)) {
    throw new HTTPException(400, { message: 'Invalid id parameter' });
  }

  const service = await servicesService.getById(id);

  if (!service) {
    throw new HTTPException(404, { message: 'Service not found' });
  }
  return c.json({ data: service });
};

export const createService = async (c: Context) => {
  const body: unknown = await c.req.json();
  const parsed = createServiceSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      400,
    );
  }

  const service = await servicesService.create(parsed.data);

  return c.json({ data: service }, 201);
};

export const updateService = async (c: Context) => {
  const id = c.req.param('id');

  if (!id || !UUID_REGEX.test(id)) {
    throw new HTTPException(400, { message: 'Invalid id parameter' });
  }

  const body: unknown = await c.req.json();
  const parsed = updateServiceSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      400,
    );
  }

  const service = await servicesService.update(id, parsed.data);

  if (!service) {
    throw new HTTPException(404, { message: 'Service not found' });
  }

  return c.json({ data: service });
};

export const deleteService = async (c: Context) => {
  const id = c.req.param('id');

  if (!id || !UUID_REGEX.test(id)) {
    throw new HTTPException(400, { message: 'Invalid id parameter' });
  }

  const service = await servicesService.remove(id);

  if (!service) {
    throw new HTTPException(404, { message: 'Service not found' });
  }

  return c.body(null, 204);
};
