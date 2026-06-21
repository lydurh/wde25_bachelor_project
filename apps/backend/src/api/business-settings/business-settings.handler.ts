import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { updateBusinessSettingsSchema } from '@repo/shared';
import { businessSettingsService } from './business-settings.service';

const factory = createFactory();

export const getBusinessSettings = async (c: Context) => {
  const data = await businessSettingsService.get();
  return c.json({ data });
};

export const updateBusinessSettings = factory.createHandlers(
  zValidator('json', updateBusinessSettingsSchema, (result, c) => {
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
    const data = await businessSettingsService.update(input);
    return c.json({ data });
  },
);
