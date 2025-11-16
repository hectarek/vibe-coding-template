/**
 * Environment Variable Validation
 *
 * Validates all environment variables at startup using Zod.
 * This ensures the app fails fast if required env vars are missing.
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Next.js
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Logging (optional)
  APP_LOG_LEVEL: z
    .string()
    .regex(/^[0-4]$/)
    .default("2")
    .transform((val) => Number.parseInt(val, 10)), // Default to info level
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get validated environment variables
 * @throws Error if environment variables are invalid
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse({
    DATABASE_URL: process.env["DATABASE_URL"],
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NODE_ENV: process.env["NODE_ENV"],
    APP_LOG_LEVEL: process.env["APP_LOG_LEVEL"],
  });

  if (!result.success) {
    const errors = result.error.issues.map((err) => {
      return `${err.path.join(".")}: ${err.message}`;
    });
    throw new Error(
      `Invalid environment variables:\n${errors.join("\n")}\n\nPlease check your .env file.`,
    );
  }

  validatedEnv = result.data;
  return validatedEnv;
}

/**
 * Note: Environment validation happens lazily when getEnv() is first called.
 * This allows the module to be imported without immediately failing if env vars
 * aren't set (useful during build time).
 *
 * The validation will still fail fast when the app actually runs and needs the env vars.
 */
