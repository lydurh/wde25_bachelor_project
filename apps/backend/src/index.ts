import { app } from './app';
import { env } from './lib/env';

declare global {
  var __serverStarted: boolean | undefined;
}

const port = env.PORT;

if (!globalThis.__serverStarted) {
  globalThis.__serverStarted = true;
  console.warn(`Server is running on http://localhost:${port}`);
}

Bun.serve({
  fetch: app.fetch,
  port,
});
