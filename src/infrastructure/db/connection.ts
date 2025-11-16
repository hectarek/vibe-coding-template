/**
 * Database Connection
 *
 * Creates and exports the Drizzle database connection using Neon serverless driver.
 * This is infrastructure code - it knows about the specific database implementation.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/src/db/schema";
import { getEnv } from "@/src/shared/config/env";

const env = getEnv();
const databaseUrl = env.DATABASE_URL;

// Create Neon client
const sql = neon(databaseUrl);

// Create Drizzle instance with schema
// @ts-expect-error - Drizzle types for neon-serverless are not fully compatible
export const db = drizzle(sql, { schema });

// Export schema for use in migrations and queries
export { schema };
