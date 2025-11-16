/**
 * Adapter: PostgresUserRepository
 *
 * PostgreSQL implementation of UserRepository using Drizzle ORM.
 * This adapter translates between domain entities and database rows.
 */

import { eq } from "drizzle-orm";
import { users } from "@/src/db/schema";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from "@/src/domain/entities/user.entity";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";
import { db } from "@/src/infrastructure/db/connection";

export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, numericId))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.toDomainEntity(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.toDomainEntity(result[0]);
  }

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date();
    const [result] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to create user");
    }

    return this.toDomainEntity(result);
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }

    if (input.email !== undefined) {
      updates.email = input.email.toLowerCase().trim();
    }

    const [result] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, numericId))
      .returning();

    if (!result) {
      return null;
    }

    return this.toDomainEntity(result);
  }

  async delete(id: string): Promise<boolean> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return false;
    }

    const result = await db
      .delete(users)
      .where(eq(users.id, numericId))
      .returning();
    return result.length > 0;
  }

  async list(limit = 10, offset = 0): Promise<User[]> {
    const results = await db.select().from(users).limit(limit).offset(offset);
    return results.map((row) => this.toDomainEntity(row));
  }

  /**
   * Convert database row to domain entity
   */
  private toDomainEntity(row: typeof users.$inferSelect): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }
}
