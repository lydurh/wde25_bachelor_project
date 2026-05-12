import { Hono } from 'hono';
import {
  forgotPasswordUser,
  loginUser,
  logoutUser,
  resetPasswordUser,
  signupUser,
  verifyEmail,
} from './auth.handler';

const authRoutes = new Hono();

authRoutes.post('/signup', signupUser);
authRoutes.post('/login', loginUser);
authRoutes.post('/logout', logoutUser);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.post('/forgot-password', forgotPasswordUser);
authRoutes.post('/reset-password', resetPasswordUser);

export { authRoutes };
