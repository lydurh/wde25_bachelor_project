import { z } from '@repo/shared';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
