/**
 * Adapter: InMemoryUserRepository
 *
 * This is an ADAPTER that implements the UserRepository port.
 * This is a simple in-memory implementation for development/testing.
 *
 * In production, you would have implementations like:
 * - PostgresUserRepository (using Drizzle ORM)
 * - MongoUserRepository
 * - NotionUserRepository (if using Notion as a database)
 *
 * The key point: The use cases don't know or care which implementation
 * is being used. They only depend on the UserRepository interface.
 */

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from "@/src/domain/entities/user.entity";
import type { UserRepository } from "@/src/domain/repositories/user.repository.port";

export class InMemoryUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();
  private emailIndex: Map<string, number> = new Map(); // email -> id
  private nextId = 1;

  async findById(id: string): Promise<User | null> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }
    return this.users.get(numericId) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = this.nextId++;
    const now = new Date();

    const user: User = {
      id,
      email: input.email.toLowerCase(),
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    this.emailIndex.set(user.email, id);

    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }

    const user = this.users.get(numericId);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...input,
      email: input.email?.toLowerCase() ?? user.email,
      updatedAt: new Date(),
    };

    // Update email index if email changed
    if (input.email && input.email !== user.email) {
      this.emailIndex.delete(user.email);
      this.emailIndex.set(updatedUser.email, numericId);
    }

    this.users.set(numericId, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return false;
    }

    const user = this.users.get(numericId);
    if (!user) return false;

    this.users.delete(numericId);
    this.emailIndex.delete(user.email);
    return true;
  }

  async list(limit = 10, offset = 0): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers.slice(offset, offset + limit);
  }
}
