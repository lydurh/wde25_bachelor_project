import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return c.json({ status: 'Hello world!' });
});

export { app };
