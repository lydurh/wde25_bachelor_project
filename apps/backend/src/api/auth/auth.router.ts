import { Hono } from 'hono';
import { loginUser, signupUser } from './auth.handler';

const authRoutes = new Hono();

authRoutes.post('/signup', signupUser);
authRoutes.post('/login', loginUser);

export { authRoutes };
