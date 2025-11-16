/**
 * Port (Interface): AuthService
 *
 * Generic authentication service interface that can be swapped out
 * with any auth provider (NextAuth, Clerk, custom, etc.)
 *
 * This keeps auth implementation details out of the domain layer.
 */

import type { User } from "@/src/domain/entities/user.entity";

export interface AuthService {
  /**
   * Get the current authenticated user from the request context
   * @returns User if authenticated, null otherwise
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Get the current user ID from the request context
   * @returns User ID if authenticated, null otherwise
   */
  getCurrentUserId(): Promise<string | null>;

  /**
   * Check if the current request is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Require authentication - throws if not authenticated
   * @throws Error if not authenticated
   */
  requireAuth(): Promise<User>;
}
