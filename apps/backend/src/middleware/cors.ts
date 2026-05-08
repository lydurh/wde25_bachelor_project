import { cors } from 'hono/cors';
import { env } from '../lib/env';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
});
