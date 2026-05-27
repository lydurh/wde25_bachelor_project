import { Hono } from 'hono';
import { corsMiddleware, loggerMiddleware, errorHandler } from './middleware';
import { api } from './api';

const app = new Hono();

app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);

app.onError(errorHandler);

app.route('/api', api);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

export { app };
