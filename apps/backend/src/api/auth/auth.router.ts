import { Hono } from 'hono';
import { loginUser, logoutUser, signupUser } from './auth.handler';

const authRoutes = new Hono();

authRoutes.post('/signup', signupUser);
authRoutes.post('/login', loginUser);
authRoutes.post('/logout', logoutUser);

export { authRoutes };
