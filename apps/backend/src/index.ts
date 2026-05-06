import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ status: 'Hello world!' });
});

export { app };
