import { z } from 'zod';

export const createServiceSchema = z.object({
  service_title: z.string().min(1).max(100),
  service_description: z.string().nullable().optional(),
  service_duration: z.number().int().positive(),
  service_price: z
    .string()
    .regex(/^\d+\.\d{2}$/, 'Price must be in format "0.00"'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = z.object({
  service_title: z.string().min(1).max(100).optional(),
  service_description: z.string().nullable().optional(),
  service_duration: z.number().int().positive().optional(),
  service_price: z
    .string()
    .regex(/^\d+\.\d{2}$/, 'Price must be in format "0.00"')
    .optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
