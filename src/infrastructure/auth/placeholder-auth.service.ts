/**
 * Placeholder AuthService Implementation
 *
 * This is a simple placeholder that can be swapped out with
 * NextAuth, Clerk, or any other auth provider.
 *
 * Replace this implementation when you're ready to add real auth.
 */

import type { User } from "@/src/domain/entities/user.entity";
import type { AuthService } from "@/src/domain/services/auth.service.port";

export class PlaceholderAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement with your chosen auth provider
    // Example: return await nextAuth.getSession()?.user
    return null;
  }

  async getCurrentUserId(): Promise<string | null> {
    // TODO: Implement with your chosen auth provider
    const user = await this.getCurrentUser();
    return user ? String(user.id) : null; // Convert number ID to string
  }

  async isAuthenticated(): Promise<boolean> {
    // TODO: Implement with your chosen auth provider
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async requireAuth(): Promise<User> {
    // TODO: Implement with your chosen auth provider
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  }
}
