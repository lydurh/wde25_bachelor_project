import { drizzle } from 'drizzle-orm/postgres-js';
// eslint-disable-next-line no-restricted-syntax
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`;

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
