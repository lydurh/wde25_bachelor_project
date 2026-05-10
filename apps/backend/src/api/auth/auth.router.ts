import { Hono } from 'hono';
import { signupUser } from './auth.handler';

const authRoutes = new Hono();

authRoutes.post('/signup', signupUser);

export { authRoutes };
