import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import postgres from 'postgres';

export function createDb(connectionString?: string) {
  if (connectionString) {
    const client = postgres(connectionString);
    return drizzlePg(client);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }
  return drizzlePglite(new PGlite());
}
