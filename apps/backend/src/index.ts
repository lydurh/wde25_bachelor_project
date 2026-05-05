import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.json({ status: "Hello world!" }));

export default app;
