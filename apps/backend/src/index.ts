import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ status: 'Hello world!' });
});

Bun.serve({
  port: 3000,
  hostname: '0.0.0.0', 
  fetch: app.fetch,
});

export { app };
