import { Hono } from 'hono';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from './business-settings.handler';
import { authMiddleware, adminMiddleware } from '../../middleware';

const businessSettingsRoutes = new Hono();

// Readable by anyone — the booking flow needs the fee threshold/amount even for
// guest bookings. Only admins may change them.
businessSettingsRoutes.get('/', getBusinessSettings);
businessSettingsRoutes.patch(
  '/',
  authMiddleware,
  adminMiddleware,
  ...updateBusinessSettings,
);

export { businessSettingsRoutes };
