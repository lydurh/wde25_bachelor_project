import { Hono } from 'hono';
import {
  loginUser,
  logoutUser,
  signupUser,
  verifyEmail,
} from './auth.handler';

const authRoutes = new Hono();

authRoutes.post('/signup', signupUser);
authRoutes.post('/login', loginUser);
authRoutes.post('/logout', logoutUser);
authRoutes.get('/verify-email', verifyEmail);

export { authRoutes };
