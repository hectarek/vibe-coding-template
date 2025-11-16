/**
 * Drizzle Database Schema
 *
 * This defines the database schema using Drizzle ORM.
 * The schema is separate from domain entities to allow for
 * database-specific optimizations while maintaining clean architecture.
 */

import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
/**
 * Users table
 * Maps to the User domain entity
 */
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type exports for Drizzle
export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
