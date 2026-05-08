// DONE: Task 3.2 - Configure PostgreSQL database (Vercel Postgres or Neon)
// TODO: Task 3.5 - Implement database connection and query utilities

//The Neon Serverless Way
/*import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle({ client: sql, schema })*/

//The Standard PostgreSQL Way
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// This creates a standard TCP connection to your local database
const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(client, { schema });
