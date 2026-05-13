import { app } from './app';

declare global {
  var __serverStarted: boolean | undefined;
}

const port = 3000;

if (!globalThis.__serverStarted) {
  globalThis.__serverStarted = true;
  console.warn(`Server is running on http://localhost:${port}`);
}

Bun.serve({
  fetch: app.fetch,
  port,
});
