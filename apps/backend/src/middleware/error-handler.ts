import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof HTTPException) {
    // If the exception carries a pre-built response (e.g. from zValidator), return it directly
    if (err.res) {
      return err.getResponse();
    }
    return c.json({ error: err.message }, err.status);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
};
