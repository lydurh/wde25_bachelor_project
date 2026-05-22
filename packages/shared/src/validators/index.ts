import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const userRoleSchema = z.enum(['client', 'admin']);

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email format')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(255, 'Password is too long')
  .regex(/^[^<>\n\r]*$/, 'Invalid characters in password');

export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(255, 'Password is too long');

export const postalCodeSchema = z
  .string()
  .trim()
  .length(4, 'Postal code must be 4 digits')
  .regex(/^\d{4}$/, 'Postal code must be 4 digits');

const NAME_PATTERN = /^[a-zA-ZæøåÆØÅ][a-zA-ZæøåÆØÅ\s'-]*$/;

type NameSchemaOptions = {
  label?: string;
};

export const nameSchema = (options: NameSchemaOptions = {}) => {
  const label = options.label ?? 'Name';
  const lengthMsg = `${label} must be between 2–20 characters`;

  return z
    .string()
    .trim()
    .min(2, lengthMsg)
    .max(20, lengthMsg)
    .regex(
      NAME_PATTERN,
      `${label} may only contain letters, spaces, hyphens, and apostrophes`,
    );
};

/** Optional last name: empty or valid name (2–20 letters). */
export const optionalNameSchema = (options: NameSchemaOptions = {}) =>
  z.union([z.literal(''), nameSchema(options)]);

type SafeStringOptions = {
  min?: number;
  max?: number;
  label?: string;
};

export const safeString = (options: SafeStringOptions = {}) => {
  const { min = 1, max = 255, label = 'Field' } = options;
  return z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} is too long`)
    .regex(/^[^<>]*$/, 'HTML tags are not allowed');
};

/** Escape user-controlled text for safe inclusion in HTML email bodies. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
