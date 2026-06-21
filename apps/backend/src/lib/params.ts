import { HTTPException } from 'hono/http-exception';
import { uuidSchema } from '@repo/shared';

export function requireUuidParam(id: string | undefined, label = 'id'): string {
  if (!id || !uuidSchema.safeParse(id).success) {
    throw new HTTPException(400, { message: `Invalid ${label} parameter` });
  }
  return id;
}
