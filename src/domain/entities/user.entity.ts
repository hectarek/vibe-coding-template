/**
 * Domain Entity: User
 *
 * This is a pure domain entity with no dependencies on frameworks or infrastructure.
 * It represents the core business concept of a User.
 *
 * Uses Zod schemas as the source of truth - types are inferred from schemas.
 */

import { z } from "zod";

/**
 * User entity schema
 * This is the source of truth for User validation and types
 */
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create user input schema
 */
export const createUserInputSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .trim(),
});

/**
 * Update user input schema
 */
export const updateUserInputSchema = z.object({
  email: z.string().email("Invalid email format").max(255).optional(),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long")
    .trim()
    .optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
