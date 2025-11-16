/**
 * Port (Interface): UserRepository
 *
 * This is a PORT in Hexagonal Architecture - it defines what operations
 * can be performed on users, but NOT how they are implemented.
 *
 * The domain layer depends on this abstraction, not concrete implementations.
 * This allows us to swap out implementations (e.g., PostgreSQL, MongoDB, Notion API)
 * without changing business logic.
 */

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from "@/src/domain/entities/user.entity";

export interface UserRepository {
  /**
   * Find a user by ID
   * @returns User if found, null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by email
   * @returns User if found, null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user
   * @returns The created user with generated ID
   */
  create(input: CreateUserInput): Promise<User>;

  /**
   * Update an existing user
   * @returns The updated user, or null if user not found
   */
  update(id: string, input: UpdateUserInput): Promise<User | null>;

  /**
   * Delete a user by ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List all users (with optional pagination)
   */
  list(limit?: number, offset?: number): Promise<User[]>;
}
